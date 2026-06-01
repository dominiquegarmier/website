import createSnakeModule from "./snake-wasm.js";

const frameMs = 1000 / 20;
const envCount = 32;
let snake;
let running = true;
let nextFrame = 0;

start();

onmessage = (event) => {
  if (event.data?.type === "stop") {
    running = false;
  }
};

function tick() {
  if (!running || !snake) return;

  const now = performance.now();
  if (now >= nextFrame) {
    postSnapshot();
    nextFrame += frameMs;
    if (nextFrame <= now) nextFrame = now + frameMs;
  }

  snake._snake_web_train(1);
  setTimeout(tick, 0);
}

async function start() {
  try {
    snake = await createSnakeModule();
    snake._snake_web_init(envCount);
    postSnapshot();
    nextFrame = performance.now() + frameMs;
    setTimeout(tick, 0);
  } catch {
    postMessage({ type: "error" });
  }
}

function postSnapshot() {
  const cellsPtr = snake._snake_web_snapshot();
  postMessage({
    type: "snapshot",
    cells: snake.HEAPU8.slice(cellsPtr, cellsPtr + 64),
    sampleRate: snake._snake_web_sample_s(),
    score: snake._snake_web_score(),
    best: snake._snake_web_best(),
    elapsed: snake._snake_web_elapsed(),
  });
}
