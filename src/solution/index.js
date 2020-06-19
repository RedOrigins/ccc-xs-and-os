const io = require("socket.io-client");
const socket = io.connect("localhost");

socket.emit("joinedGame", {
  gameId: "idhere"
});

socket.on("gameOver", (data) => {
  console.log(data);
});

takeTurn("x", 0);
takeTurn("o", 8);
takeTurn("x", 1);
takeTurn("o", 3);
takeTurn("x", 2);
           
//     |     |     
//  x  |  x  |  x  
// ____|_____|_____
//     |     |     
//  o  |  -  |  -  
// ____|_____|_____
//     |     |     
//  -  |  -  |  o  
//     |     |     

function takeTurn(piece, tile) {
  socket.emit("takeTurn", {
    piece,
    tile,
  });
}
