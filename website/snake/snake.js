const board = document.querySelector("#snake-board");
const rate = document.querySelector("#snake-rate");
const score = document.querySelector("#snake-score");
const best = document.querySelector("#snake-best");
const time = document.querySelector("#snake-time");
const glyphs = [".", "o", "#", "*"];

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

  board.replaceChildren(renderBoard(message.cells));
  rate.textContent = message.sampleRate.toFixed(0);
  score.textContent = message.score.toFixed(2);
  best.textContent = message.best;
  time.textContent = message.elapsed.toFixed(1);
});

addEventListener("pagehide", () => {
  worker.postMessage({ type: "stop" });
  worker.terminate();
});

function renderBoard(cells) {
  const fragment = document.createDocumentFragment();

  fragment.append(renderTextLine("+--------+"));

  for (let y = 0; y < 8; y += 1) {
    const row = document.createElement("div");
    row.className = "snake-row";
    row.append("|");

    for (let x = 0; x < 8; x += 1) {
      row.append(renderCell(cells[y * 8 + x]));
    }

    row.append("|");
    fragment.append(row);
  }

  fragment.append(renderTextLine("+--------+"));

  return fragment;
}

function renderTextLine(text) {
  const line = document.createElement("div");
  line.textContent = text;
  return line;
}

function renderCell(cell) {
  if (cell === 2 || cell === 3) {
    const span = document.createElement("span");
    span.className = cell === 2 ? "snake-head" : "snake-food";
    span.textContent = glyphs[cell];
    return span;
  }

  return glyphs[cell] ?? ".";
}
