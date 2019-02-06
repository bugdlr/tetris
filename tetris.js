// TO DO
// add hard drop
// score more for hard drop -- number of rows dropped plus 1
// complex scoring --back to back tetris = 1200
// animate row delete
// animation for a tetris
// add ghost piece with toggle
// add preview window
// add start button
// ready, set, go animation
// hold piece
// t-spin animation and scoring
// increase drop speed
// save high score
// make canvas size responsive

const cvs = document.getElementById("tetris");
const ctx = cvs.getContext('2d');
const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");

const ROW = 20;
const COL = 10;
const SQ = squareSize = 30;
const VACANT = "white";

// draw a square
function drawSquare(x,y,color) {
  ctx.fillStyle = color;
  ctx.fillRect(x*SQ, y*SQ, SQ, SQ);

  ctx.strokeStyle = VACANT;
  ctx.strokeRect(x*SQ, y*SQ, SQ, SQ);
}

// create the board
let board = [];
for (r = 0; r < ROW; r++) {
  board[r] = [];
  for (c = 0; c < COL; c++) {
    board[r][c] = VACANT;
  }
}

// draw the board
function drawBoard() {
  for (r = 0; r < ROW; r++) {
    for (c = 0; c < COL; c++) {
      drawSquare(c,r,board[r][c]);
    }
  }
}
drawBoard();

// the peices and their colors
const PIECES = [[Z, "red"], [S, "green"], [T, "purple"], [O, "yellow"], [I, "cyan"], [L, "orange"], [J, "blue"]];

// generate random pieces
function randomPiece(){
  let r = randomN = Math.floor(Math.random() * PIECES.length);
  return new Piece(PIECES[r][0], PIECES[r][1]);
}

let p = randomPiece();

// the Object Piece

function Piece(tetromino, color){
  this.tetromino = tetromino;
  this.color = color;

  this.tetrominoN = 0; // start from the first pattern
  this.activeTetromino = this.tetromino[this.tetrominoN];

  // piece starting position
  this.x = 3;
  this.y = -2;
}

// fill function
Piece.prototype.fill = function(color) {
  for (r = 0; r < this.activeTetromino.length; r++) {
    for (c = 0; c < this.activeTetromino.length; c++) {
      if (this.activeTetromino[r][c]) {
        drawSquare(this.x + c, this.y + r, color);
      }
    }
  }
}

// draw a piece to the board
Piece.prototype.draw = function () {
  this.fill(this.color);
}

// undraw a piece
Piece.prototype.unDraw = function() {
  this.fill(VACANT);
}

// move the piece down
Piece.prototype.moveDown = function() {
  if (!this.collision(0, 1, this.activeTetromino)) {
    this.unDraw();
    this.y++;
    this.draw();
  } else {
    // lock the pieces and generate a new one
    this.lock();
    p = randomPiece();
  }
}

// hard drop the piece
Piece.prototype.hardDrop = function() {
  // find out how far to drop
  // let bottomVacantRow = 19;
  // for (c = this.x; c < this.tetromino.length; c++) {
  //   for (r = 19; r > 1; r--) {
  //     if (board[r][c] !== VACANT && r < bottomVacantRow) {
  //       bottomVacantRow = r - 1;
  //     }
  //   }
  // }console.log(bottomVacantRow);

  if (!this.collision(0, 1, this.activeTetromino)) {
    this.unDraw();
    this.y = bottomVacantRow;
    this.draw();
    // lock the pieces and generate a new one
    this.lock();
    p = randomPiece();
}
}

// move the piece LEFT
Piece.prototype.moveLeft = function() {
  if (!this.collision(-1, 0, this.activeTetromino)) {
    this.unDraw();
    this.x--;
    this.draw();
  }
}

// move the piece RIGHT
Piece.prototype.moveRight = function() {
  if (!this.collision(1, 0, this.activeTetromino)) {
    this.unDraw();
    this.x++;
    this.draw();
  }
}

// rotate the piece
Piece.prototype.rotate = function() {
  let nextPattern = this.tetromino[(this.tetrominoN + 1)% this.tetromino.length];
  let kick = 0;

  if (this.collision(0, 0, nextPattern)) {
    if (this.x > COL/2) {
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
    this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
    this.activeTetromino = this.tetromino[this.tetrominoN];
    this.draw();
  }
}

let score = 0;
let rowsCleared = 0;
let rowsClearedperLevel = 0;
let level = 1;

Piece.prototype.lock = function() {
  for (r = 0; r < this.activeTetromino.length; r++){
    for (c = 0; c < this.activeTetromino.length; c++) {
      // skip the vacant squares
      if (!this.activeTetromino[r][c]) {
        continue;
      }
      // if pieces lock on top = game over
      if (this.y + r < 0) {
        alert("Game Over");
        gameOver = true;
        break;
      }
      // lock the piece
      board[this.y + r][this.x + c] = this.color;
    }
  }

  // remove full rows
  for(r = 0; r < ROW; r++) {
    let isRowFull = true;
    for (c = 0; c < COL; c++) {
      isRowFull = isRowFull && (board[r][c] != VACANT);
    }
    if (isRowFull) {
      rowsCleared++
      // if row is full, move down all rows above it
      for (y = r; y > 1; y--) {
        for (c = 0; c < COL; c++){
          board[y][c] = board[y-1][c];
        }
      }
      // the top row has no row above it
      for (c = 0; c < COL; c++) {
        board[0][c] = VACANT;
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
    // update the board
  }
  drawBoard();
  speedUp();

  rowsClearedperLevel += rowsCleared;
  rowsCleared = 0;
  if (rowsClearedperLevel >= 10) {
    level++;
    rowsClearedperLevel -= 10;
  }
}

// collision function
Piece.prototype.collision = function(x, y, piece) {
  for (let r = 0; r < piece.length; r++){
    for (let c = 0; c < piece.length; c++) {
      if (!piece[r][c]) {
        continue;
      }
      // coordinates of the piece after movement
      let newX = this.x + c + x;
      let newY = this.y + r + y;

      // conditions
      if (newX < 0 || newX >= COL || newY >= ROW) {
        return true;
      }

      // skip newY < 0
      if (newY < 0) {
        continue;
      }

      // check if there is a locked piece already in place
      if (board[newY][newX] != VACANT) {
        return true;
      }
    }
  }
  return false;
}

// CONTROL the pieces
document.addEventListener('keydown', CONTROL);

let paused = false;

function CONTROL(event) {
  if (event.keyCode == 80) {
    paused = !paused;
    if (paused == false) {
      requestAnimationFrame(drop);
      document.querySelector(".paused").style.display = "none";
    } else {
      document.querySelector(".paused").style.display = "block";
    }
  }
  if (paused == false) {
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
    }
  }
}

// move the piece every 1 second
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
drop();


levels = {
  // level and drop speed in ms
  00: 800, 01: 720, 02: 630, 03: 550, 04: 470, 05: 380, 06: 300, 07: 220, 08: 130, 09: 100, 10: 80, 11: 80, 12: 80, 13: 70, 14: 70, 15: 70,
  16: 50, 17: 50, 18: 50, 19: 30, 20: 30, 21: 30, 22: 30, 23: 30, 24: 30, 25: 30, 26: 30, 27: 30, 28: 30,
  29: 10
 }
