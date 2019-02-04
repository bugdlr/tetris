// TO DO
// add hard drop
// animate row delete
// score more for a tetris
// animation for a tetris
// remove inner grid lines
// add ghost piece with toggle
// add preview

const cvs = document.getElementById("tetris");
const ctx = cvs.getContext('2d');
const scoreElement = document.getElementById("score");

const ROW = 20;
const COL = 10;
const SQ = squareSize = 20;
const VACANT = "white";

// draw a square
function drawSquare(x,y,color) {
  ctx.fillStyle = color;
  ctx.fillRect(x*SQ, y*SQ, SQ, SQ);

  ctx.strokeStyle = "black";
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
const PIECES = [[Z, "red"], [S, "green"], [T, "cyan"], [O, "indigo"], [I, "blue"], [L, "purple"], [J, "orange"]];

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
  // check all rows in the current column
  // for(r = 0; r < ROW; r++) {
  //   let bottomVacantRow =
  // }
  if (!this.collision(0, 1, this.activeTetromino)) {
    this.unDraw();
    this.y += 10;
    this.draw();
  } else {
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
      score += 10;
    }
  }
  // update the board
    drawBoard();

  // update the score
    scoreElement.innerHTML = score;
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
  } else if (event.keyCode == 80) {
    paused = !paused;
    if (paused == false) {
      requestAnimationFrame(drop);
      document.querySelector(".paused").style.display = "none";
    } else {
      document.querySelector(".paused").style.display = "block";
    }
  } else if (event.keyCode == 32) {
    p.hardDrop();
  }
}

// move the piece every 1 second
let dropStart = Date.now();
let gameOver = false;

function drop() {
  let now = Date.now();
  let delta = now - dropStart;
  if (delta > 1000) {
    p.moveDown();
    dropStart = Date.now();
  }
  if (!gameOver && !paused) {
    requestAnimationFrame(drop);
  }
}
drop();
