function getGameId() {
  const metas = document.getElementsByTagName('meta')[0];
  return metas.getAttribute("gameid");
}

let isTurn = true;

$("#box-0").click(() => {
  boxClicked(0)
})

$("#box-1").click(() => {
  boxClicked(1)
})

$("#box-2").click(() => {
  boxClicked(2)
})

$("#box-3").click(() => {
  boxClicked(3)
})

$("#box-4").click(() => {
  boxClicked(4)
})

$("#box-5").click(() => {
  boxClicked(5)
})

$("#box-6").click(() => {
  boxClicked(6)
})

$("#box-7").click(() => {
  boxClicked(7)
})

$("#box-8").click(() => {
  boxClicked(8)
})

function boxClicked(tile) {
  if (!isTurn) return;
  if ($(`#box-${tile}`).text()) return;
  $(`#box-${tile}`).text("x");
  takeTurn(tile)
  isTurn = false;
}

const gameId = getGameId();

var socket = io();

socket.emit('joinedGame', {
  gameId
});


function takeTurn(tile) {

  socket.emit('takeTurn', {
    piece: "x",
    tile
  })
}

socket.on("gameOver", data => {
  console.log("Game over");
  console.log(data);
});

socket.on("piecePlaced", data => {
  $(`#box-${data.tile}`).text(data.piece);
  isTurn = true;
})