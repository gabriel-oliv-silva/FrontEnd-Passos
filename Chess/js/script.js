// ./js/script.js  (usar como módulo: <script type="module" src="./js/script.js"></script>)

import { Chess } from "./node_modules/chess.js/dist/esm/chess.js"; // ajuste se necessário (path relativo ao arquivo)

// --- símbolos e refs DOM ---
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

const hora = document.getElementById("horas");
const min = document.getElementById("minutos");
const seg = document.getElementById("segundos");

// --- Estado via chess.js ---
const chess = new Chess();
let selected = null; // string de coordenada ex: 'e2'
let flipped = false; // rotação visual
let gameOver = false; // bloqueia interações quando true

// cronômetro (sua lógica)
let segundos = 0,
  minutos = 0,
  horas = 0,
  intervalo = null,
  cronometroLigado = false;

// utilitárias para conversão
function rcToSquare(r, c) {
  return String.fromCharCode(97 + c) + (8 - r);
} // r:0..7, c:0..7
function squareToRC(sq) {
  const file = sq.charCodeAt(0) - 97; // a->0
  const rank = parseInt(sq[1], 10);
  const r = 8 - rank;
  const c = file;
  return [r, c];
}
function pieceToSymbol(piece) {
  if (!piece) return "";
  return piece.color === "w"
    ? PIECES[piece.type.toUpperCase()]
    : PIECES[piece.type.toLowerCase()];
}

// ---------- RENDER ----------
function render() {
  boardEl.innerHTML = "";
  const board = chess.board(); // matriz 8x8 do chess.js

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = document.createElement("div");
      cell.className = "cell " + ((r + c) % 2 === 0 ? "light" : "dark");
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.setAttribute("role", "gridcell");

      const piece = board[r][c];
      if (piece) {
        const p = document.createElement("div");
        p.className = "piece";
        p.textContent = pieceToSymbol(piece);
        cell.appendChild(p);
      }

      // handler wrapper que respeita gameOver
      cell.addEventListener("click", function (e) {
        if (gameOver) return;
        onCellClick.call(this, e);
      });

      boardEl.appendChild(cell);
    }
  }

  boardEl.style.transform = flipped ? "rotate(180deg)" : "rotate(0deg)";
  // gira peças para ficarem legíveis quando o tabuleiro girar
  document
    .querySelectorAll(".piece")
    .forEach(
      (p) => (p.style.transform = flipped ? "rotate(180deg)" : "rotate(0deg)")
    );

  highlightSelected();
  // atualiza label
  if (turnLabel)
    turnLabel.textContent = chess.turn() === "w" ? "Brancas" : "Pretas";
  updateStatusAndMaybeShowModal();
}

// ---------- CLIQUE ----------
function onCellClick(e) {
  const r = +this.dataset.r,
    c = +this.dataset.c;
  const square = rcToSquare(r, c);
  const piece = chess.get(square);

  if (selected) {
    if (selected === square) {
      // deseleciona
      selected = null;
      highlightSelected();
      return;
    }

    // tenta mover via chess.js (promo automática para rainha)
    const move = chess.move({ from: selected, to: square, promotion: "q" });
    if (move) {
      log(
        `${move.color === "w" ? "Brancas" : "Pretas"}: ${move.from} -> ${
          move.to
        }`
      );
      cronometrar();
      selected = null;
      // alterna rotação conforme vez
      flipped = chess.turn() === "b";
      render();
    } else {
      // se não foi válido, se clicou em peça do jogador atual, seleciona a nova
      const p2 = chess.get(square);
      if (p2 && p2.color === chess.turn()) {
        selected = square;
        highlightSelected();
      } else {
        // inválido — limpa seleção
        selected = null;
        highlightSelected();
      }
    }
  } else {
    // nenhuma seleção — seleciona se for peça da vez
    if (piece && piece.color === chess.turn()) {
      selected = square;
      highlightSelected();
    }
  }
}

// ---------- HIGHLIGHT e dicas ----------
function highlightSelected() {
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.classList.remove("selected");
    cell.classList.remove("hint");
  });

  if (!selected) return;

  // marca a casa selecionada
  const [sr, sc] = squareToRC(selected);
  const idx = sr * 8 + sc;
  const cell = boardEl.children[idx];
  if (cell) cell.classList.add("selected");

  // mostra movimentos legais via chess.moves({square, verbose:true})
  const moves = chess.moves({ square: selected, verbose: true });
  moves.forEach((m) => {
    const [mr, mc] = squareToRC(m.to);
    const mi = mr * 8 + mc;
    const mcEl = boardEl.children[mi];
    if (mcEl) mcEl.classList.add("hint");
  });
}

// ---------- STATUS e MODAL ----------
function updateStatusAndMaybeShowModal() {
  const turnName = chess.turn() === "w" ? "Brancas" : "Pretas";
  let statusText = `Vez das ${turnName}`;

  if (chess.isCheckmate()) {
    // no checkmate, chess.turn() é quem deveria jogar (o perdedor)
    const loser = chess.turn() === "w" ? "Brancas" : "Pretas";
    const winner = chess.turn() === "w" ? "Pretas" : "Brancas";
    statusText = `Xeque-mate! ${loser} foi derrotada. Vitória das ${winner}!`;
    showEndModal(
      "Xeque-mate",
      `${loser} foram derrotadas. Vitória das ${winner}!`
    );
  } else if (chess.isDraw()) {
    statusText = "Empate!";
    showEndModal("Empate", "Jogo encerrado em empate.");
  } else if (chess.inCheck()) {
    statusText += " (Xeque!)";
  }

  if (turnLabel)
    turnLabel.textContent = chess.turn() === "w" ? "Brancas" : "Pretas";
  // se tiver um elemento statusEl, atualize também (mantive compatibilidade)
  if (typeof statusEl !== "undefined" && statusEl)
    statusEl.textContent = statusText;
}

// Modal control (assume que você já adicionou o markup do modal no HTML)
function showEndModal(title, message) {
  if (gameOver) return;
  gameOver = true;

  // parar cronômetro
  try {
    pararCronometro();
  } catch (e) {}

  // bloquear interações no tabuleiro
  boardEl.style.pointerEvents = "none";

  const modal = document.getElementById("endModal");
  if (!modal) return;
  document.getElementById("endTitle").textContent = title;
  document.getElementById("endMsg").textContent = message;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeEndModal() {
  const modal = document.getElementById("endModal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  // mantém gameOver true para evitar continuação do jogo sem reload
}

// hook dos botões do modal (se existir)
document.addEventListener("DOMContentLoaded", () => {
  const playAgainBtn = document.getElementById("playAgainBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");

  if (playAgainBtn) {
    playAgainBtn.addEventListener("click", () => {
      window.location.reload();
    });
  }
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      closeEndModal();
    });
  }
});

// ---------- LOG ----------
function log(text) {
  const t = `[${new Date().toLocaleTimeString()}] ${text}\n`;
  if (logEl) logEl.textContent = t + logEl.textContent;
}

// ---------- CONTROLES (com guards) ----------
const safeAddListener = (id, fn) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("click", fn);
};
safeAddListener("resetBtn", () => {
  resetGame();
  resetarCronometro();
});
safeAddListener("undoBtn", () => {
  undo();
});
safeAddListener("flipBtn", () => {
  flipped = !flipped;
  render();
});

// ---------- RESET / UNDO ----------
function resetGame() {
  chess.reset();
  selected = null;
  flipped = false;
  gameOver = false;
  boardEl.style.pointerEvents = "auto";
  resetarCronometro();
  render();
  log("Jogo reiniciado");
}

function undo() {
  const last = chess.undo();
  if (!last) return;
  flipped = chess.turn() === "b";
  render();
  log("Desfeito último movimento");
}

// ---------- IA placeholder ----------
async function getAIMove() {
  const moves = chess.moves({ verbose: true });
  if (!moves || moves.length === 0) return null;
  return { from: moves[0].from, to: moves[0].to };
}

// -----------------------------------------------------------------
// Cronômetro
function cronometrar() {
  if (cronometroLigado) return;
  cronometroLigado = true;
  intervalo = setInterval(() => {
    segundos++;
    if (segundos === 60) {
      segundos = 0;
      minutos++;
    }
    if (minutos === 60) {
      minutos = 0;
      horas++;
    }
    if (hora) hora.innerText = horas.toString().padStart(2, "0");
    if (min) min.innerText = minutos.toString().padStart(2, "0");
    if (seg) seg.innerText = segundos.toString().padStart(2, "0");
  }, 1000);
}
function pararCronometro() {
  clearInterval(intervalo);
  cronometroLigado = false;
}
function resetarCronometro() {
  pararCronometro();
  segundos = minutos = horas = 0;
  if (hora) hora.innerText = "00";
  if (min) min.innerText = "00";
  if (seg) seg.innerText = "00";
}
render();