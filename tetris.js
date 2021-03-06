// TO DO
// animate row delete
// messaging for tetris
// t-spin animation and scoring
// score more for combos
// refactor modals
// ghost piece bug when underneath locked pieces
// glitch where it occassionally erases a locked piece during hold

// DOM elements
const cvs = document.getElementById("tetris");
const ctx = cvs.getContext('2d');
const previewWindow = document.getElementById("previewWindow");
const pwctx = previewWindow.getContext('2d');
const holdWindow = document.getElementById("holdWindow");
const hwctx = holdWindow.getContext('2d');
const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");
const highScoreElement = document.getElementById("highScore");
const startButton = document.getElementById("start");
const gameOverElement = document.getElementById("game-over");

// drawing variables
const row = 20;
const col = 10;
const sq = 30;
const vacant = "white";
const gray = "rgba(0,0,0,0.1)";

// the pieces and their colors
const pieces = [
  [Z, "red"],
  [S, "green"],
  [T, "purple"],
  [O, "yellow"],
  [I, "cyan"],
  [L, "orange"],
  [J, "blue"]
];

// the canvases
const tetris = [];
const preview = [];
const hold = [];

// scoring variables
let score = 0;
let rowsCleared = 0;
let rowsClearedperLevel = 0;
let level = 1;
let highScoreValue = highScoreElement.innerHTML;

// draw a square
function drawSquare(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * sq, y * sq, sq, sq);

  ctx.strokeStyle = vacant;
  ctx.strokeRect(x * sq, y * sq, sq, sq);
}

function drawPreview(x, y, color) {
  pwctx.fillStyle = color;
  pwctx.fillRect(x * 20, y * 20, 20, 20);

  pwctx.strokeStyle = vacant;
  pwctx.strokeRect(x * 20, y * 20, 20, 20);
}

function drawHold(x, y, color) {
  hwctx.fillStyle = color;
  hwctx.fillRect(x * 20, y * 20, 20, 20);

  hwctx.strokeStyle = vacant;
  hwctx.strokeRect(x * 20, y * 20, 20, 20);
}

// create the board
function createBoard(board, row, col) {
  for (r = 0; r < row; r++) {
    board[r] = [];
    for (c = 0; c < col; c++) {
      board[r][c] = vacant;
    }
  }
}
createBoard(tetris, 20, 10);
createBoard(preview, 4, 4);
createBoard(hold, 4, 4);

// draw the board
function drawBoard(board, row, col) {
  for (r = 0; r < row; r++) {
    for (c = 0; c < col; c++) {
      drawSquare(c, r, board[r][c]);
    }
  }
}
drawBoard(tetris, 20, 10);
drawBoard(preview, 4, 4);
drawBoard(hold, 4, 4);


// generate random pieces
function randomPiece() {
  let r = randomN = Math.floor(Math.random() * pieces.length);
  return new Piece(pieces[r][0], pieces[r][1]);
}

// set the inital pieces
let p = randomPiece();
let previewPiece = randomPiece();


// the object piece
function Piece(tetrimino, color) {
  this.tetrimino = tetrimino;
  this.color = color;

  this.tetriminoN = 0; // start from the first pattern
  this.activeTetrimino = this.tetrimino[this.tetriminoN];

  this.x = 3; // piece starting position
  this.y = -2;

  this.ghost = Object.create(this); // copy of Piece object to be used as the ghost
  this.preview = Object.create(this); // copy of Piece object to be displayed as preview
  // coordinates for preview window display
  this.preview.x = 1;
  this.preview.y = 0;
}

// fill function
Piece.prototype.fill = function(color, fun) {
  for (r = 0; r < this.activeTetrimino.length; r++) {
    for (c = 0; c < this.activeTetrimino.length; c++) {
      if (this.activeTetrimino[r][c]) {
        fun(this.x + c, this.y + r, color);
      }
    }
  }
}

// draw a piece to the board
Piece.prototype.draw = function() {
  this.fill(this.color, drawSquare);
  if (ghostOn) {
    this.ghost.ghostPosition();
    this.ghost.fill(gray, drawSquare);
  }
}

// undraw a piece
Piece.prototype.unDraw = function() {
  this.fill(vacant, drawSquare);
  if (ghostOn) {
    this.ghost.fill(vacant, drawSquare);
  }
}

// clear preview or hold areas
function clearArea(area) {
  for (r = 0; r < 4; r++) {
    for (c = 0; c < 4; c++) {
      area(r, c, vacant);
    }
  }
}

// ghost piece toggle and positioning
let ghostOn = true;
let ghostBox = document.getElementById("ghostBox");

function toggleGhost() {
  ghostOn = !ghostOn;
  if (!ghostOn) {
    p.ghost.fill(vacant);
  }
}

ghostBox.addEventListener('click', toggleGhost);

Piece.prototype.ghostPosition = function() {
  // the same as current piece, but at the bottom
  this.ghost.y = 0;
  for (let r = 0; r <= 19; r++) {
    // figure out where the bottom is
    if (!this.collision(0, 1, this.activeTetrimino)) {
      this.ghost.y++;
    }
  }
}

// ******MOVEMENT FUNCTIONS*********//

// move the piece down
Piece.prototype.moveDown = function() {
  if (!this.collision(0, 1, this.activeTetrimino)) {
    this.ghost.ghostPosition();
    this.unDraw();
    this.y++;
    this.draw();
  } else {
    // lock the pieces
    this.lock();
    // clear preview
    clearArea(drawPreview);
    // generate new pieces
    p = previewPiece;
    previewPiece = randomPiece();
    // draw the preview
    previewPiece.preview.fill(previewPiece.preview.color, drawPreview);
  }
}

// hard drop the piece
let dropDifference; // used to measure how many rows were skipped in the hard drop

Piece.prototype.hardDrop = function() {
  let startDrop = this.y; // where the piece is when hard drop is initiated
  for (r = 0; r <= 19; r++) {
    // if it doesn't collide, move the piece down
    if (!this.collision(0, 1, this.activeTetrimino)) {
      this.unDraw();
      this.y++;
    }
  }
  // once it does collide, draw it there and lock it
  this.draw();
  this.lock();
  // update the preview
  clearArea(drawPreview);
  p = previewPiece;
  previewPiece = randomPiece();
  previewPiece.preview.fill(previewPiece.preview.color, drawPreview);
  // calculate the distance dropped
  dropDifference = this.y - startDrop;
  // update the score
  score += dropDifference;
  scoreElement.innerHTML = score;
}

// move the piece LEFT
Piece.prototype.moveLeft = function() {
  if (!this.collision(-1, 0, this.activeTetrimino)) {
    this.unDraw();
    this.x--;
    this.draw();
  }
}

// move the piece RIGHT
Piece.prototype.moveRight = function() {
  if (!this.collision(1, 0, this.activeTetrimino)) {
    this.unDraw();
    this.x++;
    this.draw();
  }
}

// rotate the piece
Piece.prototype.rotate = function() {
  let nextPattern = this.tetrimino[(this.tetriminoN + 1) % this.tetrimino.length];
  let kick = 0;

  if (this.collision(0, 0, nextPattern)) {
    if (this.x > col / 2) {
      // its the right wall
      kick = -1; // move the piece to the left
    } else {
      // its the left wall
      kick = 1; // move the piece to the right
    }
  }
  if (!this.collision(kick, 0, nextPattern)) {
    this.unDraw();
    this.x += kick;
    this.tetriminoN = (this.tetriminoN + 1) % this.tetrimino.length;
    this.activeTetrimino = this.tetrimino[this.tetriminoN];
    this.draw();
  }
}

Piece.prototype.lock = function() {
  for (r = 0; r < this.activeTetrimino.length; r++) {
    for (c = 0; c < this.activeTetrimino.length; c++) {
      // skip the vacant squares
      if (!this.activeTetrimino[r][c]) {
        continue;
      }
      // if pieces lock on top = game over
      if (this.y + r < 0) {
        gameOver = true;
        if (gameOver == true) {
          gameOverElement.style.display = "block";
          startButton.style.display = "block";
          setScore();
        } else {
          gameOverElement.style.display = "none";
        }
        break;
      }
      // lock the piece
      tetris[this.y + r][this.x + c] = this.color;
      firstHold = true;
    }
  }
  // remove full rows
  for (r = 0; r < row; r++) {
    let isRowFull = true;
    for (c = 0; c < col; c++) {
      isRowFull = isRowFull && (tetris[r][c] != vacant);
    }
    if (isRowFull) {
      rowsCleared++
      // if row is full, move down all rows above it
      for (y = r; y > 1; y--) {
        for (c = 0; c < col; c++) {
          tetris[y][c] = tetris[y - 1][c];
        }
      }
      // the top row has no row above it
      for (c = 0; c < col; c++) {
        tetris[0][c] = vacant;
      }
    }
    // update the score
    if (rowsCleared == 1) {
      score += 40 * (level + 1);
    } else if (rowsCleared == 2) {
      score += 100 * (level + 1);
    } else if (rowsCleared == 3) {
      score += 300 * (level + 1);
    } else if (rowsCleared == 4) {
      score += 800 * (level + 1);
    }
    scoreElement.innerHTML = score;
    levelElement.innerHTML = level;
  }
  // update the board
  drawBoard(tetris, 20, 10);
  previewPiece.preview.fill(previewPiece.preview.color, drawPreview);
  speedUp();

  rowsClearedperLevel += rowsCleared;
  rowsCleared = 0;
  if (rowsClearedperLevel >= 10) {
    level++;
    rowsClearedperLevel -= 10;
  }
}

// hold function
let holding = false;
let heldPiece;
let unheldPiece = heldPiece;
let firstHold = true;

Piece.prototype.hold = function() {
  if (firstHold) {
    this.unDraw();
    clearArea(drawPreview);
    clearArea(drawHold);
    unheldPiece = heldPiece;
    heldPiece = p;
    firstHold = false;

    if (holding) {
      p = unheldPiece;
    } else {
      p = previewPiece;
      previewPiece = randomPiece();
    }

    this.y = -1;
    this.x = 3;
    this.preview.fill(this.preview.color, drawHold);
    previewPiece.preview.fill(previewPiece.preview.color, drawPreview);
    holding = true;
  }
}

// collision function
Piece.prototype.collision = function(x, y, piece) {
  for (let r = 0; r < piece.length; r++) {
    for (let c = 0; c < piece.length; c++) {
      if (!piece[r][c]) {
        continue;
      }
      // coordinates of the piece after movement
      let newX = this.x + c + x;
      let newY = this.y + r + y;

      // conditions
      if (newX < 0 || newX >= col || newY >= row) {
        return true;
      }

      // skip newY < 0
      if (newY < 0) {
        continue;
      }

      // check if there is a locked piece already in place
      if (tetris[newY][newX] != vacant && tetris[newY][newX] != gray) {
        return true;
      }
    }
  }
  return false;
}

// CONTROL the pieces
document.addEventListener('keydown', CONTROL);

let paused = false;

function pause() {
  paused = !paused;
  if (startButton.style.display == "none" && !iModal.classList.contains("show-modal") && !sModal.classList.contains("show-modal")) {
    if (paused == false) {
      requestAnimationFrame(drop);
      document.querySelector(".paused").style.display = "none";
    } else {
      document.querySelector(".paused").style.display = "block";
    }
  }
}

function CONTROL(event) {
  if (event.keyCode == 80) {
    pause();
  }
  if (paused == false && gameOver == false && ready.style.WebkitAnimationPlayState != "running") {
    if (event.keyCode == 37) {
      p.moveLeft();
      dropStart.Date.now();
    } else if (event.keyCode == 38) {
      p.rotate();
      dropStart.Date.now();
    } else if (event.keyCode == 39) {
      p.moveRight();
      dropStart.Date.now();
    } else if (event.keyCode == 40) {
      p.moveDown();
    } else if (event.keyCode == 32) {
      p.hardDrop();
    } else if (event.keyCode == 16) {
      p.hold();
    }
  }
}

// the falling of the blocks
let dropStart = Date.now();
let gameOver = false;
let rate = 800;

function speedUp() {
  rate = levels[level - 1]
}

function drop() {
  let now = Date.now();
  let delta = now - dropStart;
  if (delta > rate) {
    p.moveDown();
    dropStart = Date.now();
  }
  if (!gameOver && !paused) {
    requestAnimationFrame(drop);
  }
}

// start game animation sequence
const ready = document.querySelector("#ready");
const set = document.querySelector("#set");
const go = document.querySelector("#go");

function readySetGo() {
  ready.style.WebkitAnimationPlayState = "running";
  set.style.WebkitAnimationPlayState = "running";
  go.style.WebkitAnimationPlayState = "running";
  setTimeout(readyAgain, 4000);
}

function readyAgain() {
  ready.removeAttribute("style");
  set.removeAttribute("style");
  go.removeAttribute("style");
}

function setScore() {
  if (gameOver == true) {
    if (highScoreElement.innerHTML < score) {
      highScoreValue = score;
      highScoreElement.innerHTML = highScoreValue;
    }
    localStorage.setItem('highScore', highScoreValue);
  }
}

function reset() {
  score = 0;
  level = 1;
  gameOver = false;
  scoreElement.innerHTML = score;
  levelElement.innerHTML = level;
  startButton.style.display = "none";
  startButton.innerHTML = "Play Again?"
  startButton.classList.add("play-again");
  gameOverElement.style.display = "none";
  clearArea(drawPreview);
  clearArea(drawHold);
  holding = false;
  createBoard(tetris, 20, 10);
  drawBoard(tetris, 20, 10);
  readySetGo();
  rate = 800;
  setTimeout(drop, 4000);
}

startButton.addEventListener('click', reset);

// retrieve high score from local storage
highScoreElement.innerHTML = localStorage.getItem('highScore');

// toggle modals
const iModal = document.querySelector(".instruction-modal");
const sModal = document.querySelector(".settings-modal");
const iTrigger = document.querySelector(".instruction-trigger");
const sTrigger = document.querySelector(".settings-trigger");
const iCloseButton = document.querySelector(".close-iButton");
const sCloseButton = document.querySelector(".close-sButton");

function toggleModal(modal) {
  modal.classList.toggle("show-modal");
  if (!paused && modal.classList.contains("show-modal")) {
    pause();
  } else {
    pause();
  }
}

function windowOnClick(event) {
  if (event.target === iModal) {
    toggleModal(iModal);
  }
}

function sWindowOnClick(event) {
  if (event.target === sModal) {
    toggleModal(sModal);
  }
}

iTrigger.addEventListener("click", function() {
  toggleModal(iModal)
});
sTrigger.addEventListener("click", function() {
  toggleModal(sModal)
});
iCloseButton.addEventListener("click", function() {
  toggleModal(iModal)
});
sCloseButton.addEventListener("click", function() {
  toggleModal(sModal)
});
window.addEventListener("click", windowOnClick);
window.addEventListener("click", sWindowOnClick);
