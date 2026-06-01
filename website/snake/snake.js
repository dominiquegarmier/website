const board = document.querySelector("#snake-board");
const rate = document.querySelector("#snake-rate");
const score = document.querySelector("#snake-score");
const best = document.querySelector("#snake-best");
const time = document.querySelector("#snake-time");
const meta = document.querySelector(".snake-meta");
const stats = document.querySelectorAll(".snake-stat-value");
const glyphs = [".", "o", "#", "*"];
const baseRows = [];
const overlayRows = [];
let boardReady = false;

const worker = new Worker(new URL("./snake-worker.js", import.meta.url), {
  type: "module",
});

worker.addEventListener("message", (event) => {
  const message = event.data;

  if (message.type === "error") {
    board.textContent = "failed to load snake";
    return;
  }

  if (message.type !== "snapshot") return;

  updateBoard(message.cells);
  rate.textContent = message.sampleRate.toFixed(0);
  score.textContent = message.score.toFixed(2);
  best.textContent = message.best;
  time.textContent = message.elapsed.toFixed(1);
  syncStatRainbow();
});

addEventListener("pagehide", () => {
  worker.postMessage({ type: "stop" });
  worker.terminate();
});

function initBoard() {
  const layers = document.createElement("div");
  const base = document.createElement("div");
  const overlay = document.createElement("div");

  layers.className = "snake-board-layers";
  base.className = "snake-board-base";
  overlay.className = "snake-board-overlay";

  for (let index = 0; index < 10; index += 1) {
    const baseLine = renderTextLine("");
    const overlayLine = renderTextLine("");
    baseRows.push(baseLine);
    overlayRows.push(overlayLine);
    base.append(baseLine);
    overlay.append(overlayLine);
  }

  layers.append(base, overlay);
  board.replaceChildren(layers);
  boardReady = true;
}

function updateBoard(cells) {
  if (!boardReady) initBoard();

  baseRows[0].textContent = "+--------+";
  overlayRows[0].textContent = "          ";

  for (let y = 0; y < 8; y += 1) {
    let baseRow = "|";
    let overlayRow = " ";

    for (let x = 0; x < 8; x += 1) {
      const cell = cells[y * 8 + x];
      baseRow += cell > 0 ? " " : ".";
      overlayRow += cell > 0 ? glyphs[cell] : " ";
    }

    baseRows[y + 1].textContent = `${baseRow}|`;
    overlayRows[y + 1].textContent = `${overlayRow} `;
  }

  baseRows[9].textContent = "+--------+";
  overlayRows[9].textContent = "          ";
}

function renderTextLine(text) {
  const line = document.createElement("div");
  line.textContent = text;
  return line;
}

function syncStatRainbow() {
  const metaBox = meta.getBoundingClientRect();

  for (const stat of stats) {
    const statBox = stat.getBoundingClientRect();
    const offset = statBox.left - metaBox.left;
    stat.style.setProperty("--rainbow-size", `${metaBox.width * 3}px`);
    stat.style.setProperty("--rainbow-start", `${-offset}px`);
    stat.style.setProperty("--rainbow-end", `${metaBox.width * 3 - offset}px`);
  }
}

addEventListener("resize", syncStatRainbow);
