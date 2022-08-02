import { memory } from "wasm-game-of-life-iorn/wasm_game_of_life_iorn_bg";
import { Universe, Cell } from "wasm-game-of-life-iorn";

const CELL_SIZE = 5;
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";
const universe = Universe.new();
const width = universe.width();
const height = universe.height();
const canvas = document.getElementById("game-of-life-canvas");
const playPauseButton = document.getElementById("play-pause");
canvas.width = (CELL_SIZE + 1) * width + 1;
canvas.height = (CELL_SIZE + 1) * height + 1;

const ctx = canvas.getContext("2d");
let animationId = null;

const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
  }

  for (let j = 0; j <= height; j++) {
    ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
    ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
  }
  ctx.stroke();
};

const getIndex = (row, column) => {
  return row * width + column;
};

const drawCells = () => {
  const cellsPtr = universe.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

  ctx.beginPath();

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);

      ctx.fillStyle = cells[idx] === Cell.Dead ? DEAD_COLOR : ALIVE_COLOR;

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  ctx.stroke();
};

const renderLoop = () => {
  debugger;
  fps.render();

  universe.tick();

  drawGrid();
  drawCells();
  animationId = requestAnimationFrame(renderLoop);
};
const isPaused = () => {
  return animationId === null;
};

const play = () => {
  playPauseButton.textContent = "停止";
  renderLoop();
};

const pause = () => {
  playPauseButton.textContent = "再生";
  cancelAnimationFrame(animationId);
  animationId = null;
};

playPauseButton.addEventListener("click", (e) => {
  if (isPaused()) {
    play();
  } else {
    pause();
  }
});

canvas.addEventListener("click", (e) => {
  const boundingRect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / boundingRect.width;
  const scaleY = canvas.height / boundingRect.height;

  const canvasLeft = (e.clientX - boundingRect.left) * scaleX;
  const canvasTop = (e.clientY - boundingRect.top) * scaleY;

  const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
  const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

  universe.toggle_cell(row, col);

  drawGrid();
  drawCells();
});

pause();

const fps = new (class {
  constructor() {
    this.fps = document.getElementById("fps");
    this.frames = [];
    this.lastFrameTimeStamp = performance.now();
  }

  render() {
    const now = performance.now();

    const delta = now - this.lastFrameTimeStamp;

    this.lastFrameTimeStamp = now;

    const fps = (1 / delta) * 1000;

    this.frames.push(fps);

    if (this.frames.length > 100) {
      this.frames.shift();
    }

    let min = Infinity;
    let max = -Infinity;
    let sum = 0;

    for (let i = 0; i < this.frames.length; i++) {
      sum += this.frames[i];
      min = Math.min(min, this.frames[i]);
      max = Math.max(max, this.frames[i]);
    }
    let mean = sum / this.frames.length;

    this.fps.textContent = `Frames per Second:
      latest => ${Math.round(fps)}
      average => ${Math.round(mean)}
      min => ${Math.round(min)}
      max => ${Math.round(max)}
      `.trim();
  }
})();
