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
        // se o rei desta cor estiver em cheque, destaca
        if (
          piece.type === "k" &&
          chess.inCheck() &&
          piece.color === chess.turn()
        ) {
          p.classList.add("king-check");
        }
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

  highlightSelected();
  // atualiza label
  if (turnLabel)
    turnLabel.textContent = chess.turn() === "w" ? "Brancas" : "Pretas";
  updateStatusAndMaybeShowModal();
}

// ---------- CLIQUE ----------
// substitua sua função onCellClick por esta (cole sobre a antiga)
// substitua sua função onCellClick por esta
function onCellClick(e) {
  const r = +this.dataset.r, c = +this.dataset.c;
  const square = rcToSquare(r, c);
  const piece = chess.get(square);

  if (selected) {
    if (selected === square) {
      selected = null;
      highlightSelected();
      return;
    }

    // se não for legal, trocar seleção se clicou em peça própria
    if (!isLegalMove(selected, square)) {
      const p2 = chess.get(square);
      if (p2 && p2.color === chess.turn()) {
        selected = square;
        highlightSelected();
      } else {
        selected = null;
        highlightSelected();
      }
      return;
    }

    // aqui: movimento é legal -> ANIMAÇÃO ANTES de aplicar o chess.move()
    // símbolos para efeito visual
    const fromPieceBefore = chess.get(selected);
    const destPieceBefore = chess.get(square); // peça que existe no destino (se for captura)
    const fromSymbol = pieceToSymbol(fromPieceBefore);
    const toSymbol = destPieceBefore ? pieceToSymbol(destPieceBefore) : fromSymbol;

    // coords DOM
    const [fr, fc] = squareToRC(selected);
    const [tr, tc] = squareToRC(square);

    // pega elementos DOM da origem/destino (se existirem)
    const fromCell = boardEl.children[fr * 8 + fc];
    const toCell   = boardEl.children[tr * 8 + tc];
    const originPieceEl = fromCell ? fromCell.querySelector('.piece') : null;
    const existingDestPiece = toCell ? toCell.querySelector('.piece') : null;

    // Esconder IMEDIATAMENTE os elementos DOM visíveis para evitar duplicata fantasma
    if (originPieceEl) {
      originPieceEl.style.transition = 'opacity 100ms linear';
      originPieceEl.style.opacity = '0';
      // forçar visibility hidden logo depois (pequeno delay evita flicker em alguns browsers)
      setTimeout(() => { originPieceEl.style.visibility = 'hidden'; }, 80);
    }
    if (existingDestPiece) {
      // marca remoção suave, e também esconde para evitar flashes
      existingDestPiece.classList.add('removing');
      existingDestPiece.style.visibility = 'hidden';
    }

    // bloqueia interações enquanto anima
    boardEl.style.pointerEvents = 'none';

    // ANIMAÇÃO: fade bonito (faz os fades de saída/entrada)
    animateFadeMove(fromSymbol, toSymbol, fr, fc, tr, tc, () => {
      // depois da animação, aplica o movimento real e atualiza o DOM
      chess.move({ from: selected, to: square, promotion: 'q' });
      // reativa interações
      boardEl.style.pointerEvents = 'auto';
      // limpa seleção e atualiza UI
      selected = null;
      cronometrar();
      log(`${(fromPieceBefore.color === 'w') ? 'Brancas' : 'Pretas'}: ${selected || '??'} -> ${square}`);
      render(); // renderiza estado real (inclui destaque de xeque)
    });

  } else {
    // nenhuma seleção — seleciona se for peça da vez
    if (piece && piece.color === chess.turn()) {
      selected = square;
      highlightSelected();
    }
  }
}

// adiciona essa função ao seu script.js
// adiciona esta função ao seu script.js (para criar o fade bonito)
function animateFadeMove(fromSymbol, toSymbol, fr, fc, tr, tc, onDone) {
  const S = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--size')) || 64;

  const fromX = fc * S, fromY = fr * S;
  const toX   = tc * S, toY   = tr * S;

  // cria elemento de saída (fade out)
  const fpOut = document.createElement('div');
  fpOut.className = 'fade-piece';
  fpOut.textContent = fromSymbol;
  fpOut.style.left = '0';
  fpOut.style.top = '0';
  fpOut.style.transform = `translate(${fromX}px, ${fromY}px) scale(1)`;
  fpOut.style.opacity = '1';
  boardEl.appendChild(fpOut);

  // cria elemento de entrada (fade in) no destino
  const fpIn = document.createElement('div');
  fpIn.className = 'fade-piece enter';
  fpIn.textContent = toSymbol;
  fpIn.style.left = '0';
  fpIn.style.top = '0';
  fpIn.style.transform = `translate(${toX}px, ${toY}px) scale(0.85)`;
  fpIn.style.opacity = '0';
  fpIn.style.filter = 'blur(2px)';
  boardEl.appendChild(fpIn);

  // força reflow
  void fpOut.offsetWidth;

  // executa animação: saída sobe/fade; entrada cresce e fica opaca
  fpOut.classList.add('exit');
  requestAnimationFrame(() => {
    fpIn.classList.remove('enter');
    fpIn.style.opacity = '1';
    fpIn.style.transform = `translate(${toX}px, ${toY}px) scale(1)`;
    fpIn.style.filter = 'blur(0)';
  });

  // remover ambos depois de terminarem (ou fallback)
  let doneCount = 0;
  function maybeDone() {
    doneCount++;
    if (doneCount >= 2) {
      if (fpOut.parentElement) fpOut.parentElement.removeChild(fpOut);
      if (fpIn.parentElement)  fpIn.parentElement.removeChild(fpIn);
      if (typeof onDone === 'function') onDone();
    }
  }

  const outEnd = (ev) => { if (ev.propertyName === 'opacity' || ev.propertyName === 'transform') { fpOut.removeEventListener('transitionend', outEnd); maybeDone(); } };
  const inEnd  = (ev) => { if (ev.propertyName === 'opacity' || ev.propertyName === 'transform') { fpIn.removeEventListener('transitionend', inEnd); maybeDone(); } };

  fpOut.addEventListener('transitionend', outEnd);
  fpIn.addEventListener('transitionend', inEnd);

  // fallback seguro
  setTimeout(() => {
    if (fpOut.parentElement) try { fpOut.parentElement.removeChild(fpOut); } catch(e){}
    if (fpIn.parentElement)  try { fpIn.parentElement.removeChild(fpIn); } catch(e){}
    if (doneCount < 2 && typeof onDone === 'function') onDone();
  }, 200);
}
// verifica se um movimento from->to é legal (usa chess.js, sem mutar o estado)
function isLegalMove(from, to) {
  const moves = chess.moves({ square: from, verbose: true }) || [];
  return moves.some(m => m.to === to);
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

function escolha(num) {
  const escolhaEl = document.getElementById("escolha");
  const wrapEl = document.getElementsByClassName("wrap")[0];

  escolhaEl.classList.add("fadeout");
  setTimeout(() => {
    escolhaEl.style.display = "none";
  }, 300); // espera o fade terminar

  if (num === 1) {
    escolhaEl.classList.remove("fadeout");
    wrapEl.style.display = "flex";
    wrapEl.classList.add("fadein");
    setTimeout(() => wrapEl.classList.remove("fadein"), 300);

    log("Protótipo pronto — PvP local ativo");
    render();
  } else {
    getAIMove();
    console.log("Protótipo IA em construção... STATUS: 1%");
    alert(
      "Protótipo IA em produção...\nSTATUS: 1%\nA página será recarregada em 5 segundos;"
    );
    setTimeout(() => {
      let s = 5;
      const interval = setInterval(() => {
        console.log(`Reiniciando em ${s} segundos;`);
        s--;
        if (s === 0) {
          clearInterval(interval);
          window.location.reload(true);
        }
      }, 1000);
    }, 3000);
  }
}

// 🔥 isto torna a função acessível fora do módulo:
window.escolha = escolha;
