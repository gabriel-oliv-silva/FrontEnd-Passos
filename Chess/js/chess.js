// ----------------------------
// Protótipo: PvP local com rotação do tabuleiro
// Usa chess.js (v1) para regras. Se quiser, inclua chess.js via CDN no futuro.
// Aqui usamos uma implementação simples das regras internamente para manter tudo "standalone".
// ----------------------------

// Representação 8x8 — linha 0 = rank 8
let boardState = [
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"],
];

const PIECES = {
  r: "♜",
  n: "♞",
  b: "♝",
  q: "♛",
  k: "♚",
  p: "♟",
  R: "♖",
  N: "♘",
  B: "♗",
  Q: "♕",
  K: "♔",
  P: "♙",
};
document.body.classList.add("fadein");
const boardEl = document.getElementById("board");
const turnLabel = document.getElementById("turnLabel");
const logEl = document.getElementById("log");
let selected = null; // [r,c]
let history = [];
let turn = "w"; // 'w' or 'b'
let flipped = false; // visual rotation state (true when black at bottom)

const hora = document.getElementById("horas");
const min = document.getElementById("minutos");
const seg = document.getElementById("segundos");
let cronometro = false;
  console.log(cronometro);

function render() {
  boardEl.innerHTML = "";
  // decide render order according to flipped
  const rows = [...Array(8).keys()];
  const cols = [...Array(8).keys()];
  const rOrder = flipped ? rows : rows; // we'll place transform instead of reordering cells

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = document.createElement("div");
      cell.className = "cell " + ((r + c) % 2 === 0 ? "light" : "dark");
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.setAttribute("role", "gridcell");
      const piece = boardState[r][c];
      if (piece) {
        const p = document.createElement("div");
        p.className = "piece";
        p.textContent = PIECES[piece] || piece;
        cell.appendChild(p);
      }
      cell.addEventListener("click", onCellClick);
      boardEl.appendChild(cell);
    }
  }
  boardEl.style.transform = flipped ? "rotate(180deg)" : "rotate(0deg)";
  // when rotated, rotate pieces back so they stay readable
  document
    .querySelectorAll(".piece")
    .forEach(
      (p) => (p.style.transform = flipped ? "rotate(180deg)" : "rotate(0deg)")
    );
  highlightSelected();
  turnLabel.textContent = turn === "w" ? "Brancas" : "Pretas";
}

function onCellClick(e) {
  const r = +this.dataset.r,
    c = +this.dataset.c;
  const piece = boardState[r][c];
  // seleção
  if (selected) {
    const [sr, sc] = selected;
    // se clicar na mesma casa -> deseleciona
    if (sr === r && sc === c) {
      selected = null;
      highlightSelected();
      return;
    }
    // tenta mover
    if (canMove(sr, sc, r, c)) {
      makeMove(sr, sc, r, c);
      selected = null;
      render();
      postMove();
    } else {
      // se clicou em outra peça do mesmo lado, trocar seleção
      if (piece && isPieceColor(piece) === turn) {
        selected = [r, c];
        highlightSelected();
      }
    }
  } else {
    if (piece && isPieceColor(piece) === turn) {
      selected = [r, c];
      highlightSelected();
    }
  }
}

function highlightSelected() {
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.classList.remove("selected");
    cell.classList.remove("hint");
  });
  if (selected) {
    const [r, c] = selected;
    const idx = r * 8 + c;
    const cell = boardEl.children[idx];
    if (cell) cell.classList.add("selected");
    //Hints: mostra movimentos possíveis simples (não completa: peões e captura simples)
    const moves = pseudoLegalMovesFor(selected[0], selected[1]);
    moves.forEach(([mr, mc]) => {
      const mi = mr * 8 + mc;
      const mcEl = boardEl.children[mi];
      if (mcEl) mcEl.classList.add("hint");
    });
  }
}

function isPieceColor(piece) {
  return piece.toUpperCase() === piece ? "w" : "b";
}

function canMove(sr, sc, tr, tc) {
  const piece = boardState[sr][sc];
  if (!piece) return false;
  // impõe cor do turno
  if (isPieceColor(piece) !== turn) return false;
  const moves = pseudoLegalMovesFor(sr, sc);
  return moves.some((m) => m[0] === tr && m[1] === tc);
}

function pseudoLegalMovesFor(r, c) {
  const piece = boardState[r][c];
  if (!piece) return [];
  const color = isPieceColor(piece);
  const moves = [];
  const p = piece.toLowerCase();
  if (p === "p") {
    const dir = color === "w" ? -1 : 1;
    const nr = r + dir;
    if (inBoard(nr, c) && !boardState[nr][c]) moves.push([nr, c]);
    // captures
    for (const dc of [-1, 1]) {
      const nc = c + dc;
      if (
        inBoard(nr, nc) &&
        boardState[nr][nc] &&
        isPieceColor(boardState[nr][nc]) !== color
      )
        moves.push([nr, nc]);
    }
    // initial double move
    const startRow = color === "w" ? 6 : 1;
    if (
      r === startRow &&
      !boardState[r + dir][c] &&
      !boardState[r + 2 * dir][c]
    )
      moves.push([r + 2 * dir, c]);
  } else if (p === "n") {
    const del = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ];
    for (const [dr, dc] of del) {
      const nr = r + dr,
        nc = c + dc;
      if (
        inBoard(nr, nc) &&
        (!boardState[nr][nc] || isPieceColor(boardState[nr][nc]) !== color)
      )
        moves.push([nr, nc]);
    }
  } else if (p === "b" || p === "r" || p === "q") {
    const dirs =
      p === "b"
        ? [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1],
          ]
        : p === "r"
        ? [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
          ]
        : [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1],
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
          ];
    for (const [dr, dc] of dirs) {
      let nr = r + dr,
        nc = c + dc;
      while (inBoard(nr, nc)) {
        if (!boardState[nr][nc]) moves.push([nr, nc]);
        else {
          if (isPieceColor(boardState[nr][nc]) !== color) moves.push([nr, nc]);
          break;
        }
        nr += dr;
        nc += dc;
      }
    }
  } else if (p === "k") {
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr,
          nc = c + dc;
        if (
          inBoard(nr, nc) &&
          (!boardState[nr][nc] || isPieceColor(boardState[nr][nc]) !== color)
        )
          moves.push([nr, nc]);
      }
  }
  return moves;
}

function inBoard(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function makeMove(sr, sc, tr, tc) {
  const from = `${sr},${sc}`;
  const to = `${tr},${tc}`;
  history.push({
    from,
    to,
    piece: boardState[sr][sc],
    captured: boardState[tr][tc],
  });
  boardState[tr][tc] = boardState[sr][sc];
  boardState[sr][sc] = "";
  log(`${turn === "w" ? "Brancas" : "Pretas"}: ${from} -> ${to}`);
  cronometro = true;
  cronometrar();
  console.log(cronometro);
}

function postMove() {
  // alterna turno
  turn = turn === "w" ? "b" : "w";
  // gira visualmente: queremos que o jogador da vez veja as peças dele "embaixo". Se for preto, flip true.
  flipped = turn === "b";
  render();
}

function log(text) {
  const t = `[${new Date().toLocaleTimeString()}] ${text}\n`;
  logEl.textContent = t + logEl.textContent;
}

// controles
document.getElementById("resetBtn").addEventListener("click", () => {
  resetGame();
  cronometro = false;
  cronometrar()
});
document.getElementById("undoBtn").addEventListener("click", () => {
  undo();
});
document.getElementById("flipBtn").addEventListener("click", () => {
  flipped = !flipped;
  render();
});

function resetGame() {
  boardState = [
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    ["R", "N", "B", "Q", "K", "B", "N", "R"],
  ];
  history = [];
  turn = "w";
  flipped = false;
  selected = null;
  render();
  log("Jogo reiniciado");
}

function undo() {
  const last = history.pop();
  if (!last) return;
  const [sr, sc] = last.from.split(",").map(Number);
  const [tr, tc] = last.to.split(",").map(Number); // revert
  boardState[sr][sc] = last.piece;
  boardState[tr][tc] = last.captured || "";
  // volta turno
  turn = turn === "w" ? "b" : "w";
  flipped = turn === "b";
  render();
  log("Desfeito último movimento");
}

// Placeholder: função para integrar IA futuramente.
// Deve retornar um objeto {from:[r,c], to:[r,c]} ou null
async function getAIMove() {
  // Exemplo simples: escolhe primeiro movimento legal disponível
  // Implementação real: usar stockfish.js ou chamar backend com engine
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const piece = boardState[r][c];
      if (piece && isPieceColor(piece) !== turn) continue; // IA joga do lado do 'turn'
      const moves = pseudoLegalMovesFor(r, c);
      if (moves.length) return { from: [r, c], to: moves[0] };
    }
  return null;
}

// Inicializa
function escolha(num) {
  
  document.getElementById("escolha").classList.add("fadeout");
  document.getElementById("escolha").style.display = "none";

  if (num == 1) {
    document.getElementById("escolha").classList.remove("fadeout");
    document.getElementsByClassName("wrap")[0].style.display = "flex";
    document.getElementsByClassName("wrap")[0].classList.add("fadein");
    document.getElementsByClassName("wrap")[0].classList.remove("fadein");
    log("Protótipo pronto — PvP local ativo");
    render();
  } else {
    getAIMove();
    console.log("Protótipo IA em construção... \n STATUS: 1%");
    alert("Protótipo IA em produção... \n STATUS: 1%; \nA página será recarregada em 5 segundos;");

    setTimeout(() => {
      let s = 5;
      setInterval(() => {
        console.log(`Reiniciando em ${s} segundos;`);
        s--;
        if (s == 0) window.location.reload(true);

      }, 1000);
    }, 3000);

    return;
  }
}
function cronometrar(){
while (cronometro == true){
  let segundos = 0;
  let minutos = 0;
  let horas = 0;

  setInterval(() => {
    segundos++;
    if (segundos > 0 && segundos < 10) segundos = "0" + segundos;

    if (segundos == 60) {
      segundos = 0;
      minutos++;
      if (minutos > 0 && minutos < 10) {
        minutos = "0" + minutos;
      }
    } else if (minutos == 60) {
      minutos = 0;
      horas++;
      if (horas > 0 && horas < 10) horas = "0" + horas;
    }

    hora.innerText = horas;
    min.innerText = minutos;
    seg.innerText = segundos;
  }, 1000);

}
}