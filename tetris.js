const cvs = document.getElementById("tetris");
const ctx = cvs.getContext('2d');
const SQ = 20;
const ROW = 20;
const COL = 10;
const VACANT = "white";

let board = [];

for (let r = 0; r < ROW; r++) {
  board[r] = [];
  for (let c = 0; c < COL; c++) {
    board[r][c] = VACANT;
  }
}

function drawSquare(x,y,color) {
  ctx.fillStyle = color;
  ctx.fillRect(x*SQ, y*SQ, SQ, SQ);
  ctx.strokeStyle = "black";
  ctx.strokeRect(x*SQ, y*SQ, SQ, SQ);
}

function drawBoard() {
  for (let r = 0; r < ROW; r++) {
    for (let c = 0; c < COL; c++) {
      drawSquare(c,r,board[r][c]);
    }
  }
}
drawBoard();

const Z = [
  [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
  ],
  [
    [0, 0, 1],
    [0, 1, 1],
    [0, 1, 0]
  ],
  [
    [0, 0, 0],
    [1, 1, 0],
    [0, 1, 1]
  ],
  [
    [0, 1, 0],
    [1, 1, 0],
    [1, 0, 0]
  ]
]

let piece = Z[0];
const pieceColor = "orange";

function drawPiece(piece) {
  for (r = 0; r < piece.length; r++) {
    for (c = 0; r < piece.length; c++) {
      if (piece[r][c]) {
        drawSquare(c,r,pieceColor);
      }
    }
  }
}
