var socket = io();

function getGameId() {
  const metas = document.getElementsByTagName('meta')[0];
  return metas.getAttribute("gameid");
}

const gameId = getGameId();


const cross = `
<div class="icon">
  <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#DB162F"/>
    <rect x="38.5442" y="31.4731" width="82" height="10" transform="rotate(45 38.5442 31.4731)" fill="white"/>
    <rect x="31.4731" y="89.4558" width="82" height="10" transform="rotate(-45 31.4731 89.4558)" fill="white"/>
  </svg>
</div>
`

const nought = `
<div class="icon">
  <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#16DB7C"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M63.5 107C86.9721 107 106 87.9721 106 64.5C106 41.0279 86.9721 22 63.5 22C40.0279 22 21 41.0279 21 64.5C21 87.9721 40.0279 107 63.5 107ZM63.5 97C81.4493 97 96 82.4493 96 64.5C96 46.5507 81.4493 32 63.5 32C45.5507 32 31 46.5507 31 64.5C31 82.4493 45.5507 97 63.5 97Z" fill="white"/>
  </svg>
</div>
`

let isTurn = true;

$(document).ready(function () {
  for (let i = 0; i <= 8; i++) {
    let elem = $(`#box-${i}`)
    elem.click(function () {
      if (!elem.hasClass("cursor-pointer") || !isTurn) return;
      elem.removeClass("cursor-pointer");
      elem.append(cross);
      socket.emit('takeTurn', {
        piece: "x",
        tile: i
      })
      isTurn = false;
    })
  }
})



socket.emit('joinedGame', {
  gameId
});


socket.on("piecePlaced", data => {
  $(`#box-${data.tile}`).append(nought);
  $(`#box-${data.tile}`).removeClass("cursor-pointer");
  isTurn = true;
})

socket.on("gameOver", data => {
  isTurn = false;
  console.log(data);
})