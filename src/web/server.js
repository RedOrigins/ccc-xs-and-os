// Importing dependancies
const express = require("express");
const socket = require("socket.io");
const rateLimit = require("express-rate-limit");
const {
  uuid
} = require("uuidv4");
const ComputerMove = require("tic-tac-toe-minimax").default.ComputerMove;

const app = express();

// Loading environment variables
// ? Is this required?
const PORT = process.env.PORT || 3000;
const FLAG = process.env.FLAG || "Testing Flag.";
const MAX_GAMES = 1000;

// For minimax package
const HUMAN_PIECE = "x";
const AI_PIECE = "o";
const symbols = {
  huPlayer: HUMAN_PIECE,
  aiPlayer: AI_PIECE,
};
const difficulty = "Hard";

// Object containing all active games, indexed by socked connectin ID
let games = {};

// Rate limiter on express app
// ? Is this required?
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  // Renders page with gameId, but it isn't ever actually used for anything, just to flesh things out a bit
  res.render("index", {
    gameId: uuid(),
  });
});
// Initialise servers
const server = app.listen(PORT, () =>
  console.log(`Server listening on port ${PORT}.`)
);
const io = socket(server);

io.on("connection", (socket) => {

  // Data contains gameId, emitted when a user wishes to start a game
  socket.on("joinedGame", (data) => {
    // Option for limiting maximum number of concurrent games, should this be an issue
    //if (Object.keys(games).length > MAX_GAMES) return;

    // Games are indexed by the socket id. This would not work if the game was really multiplayer
    // But it simplifies things in a 'fake' multiplayer.
    games[socket.id] = {
      gameId: data.gameId,
      board: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      currentTurn: "x",
    };
  });

  // ! This is the vulnerable function in this challenge
  // ! There are no checks for who is playing as which piece
  // ! Meaning the player can play the moves of the other player,
  // ! There are still checks for alternating turns, but the second
  // ! Player will have a delay on their turns, allowing for an entire game to be
  // ! Played out before they get to play their first move. This will probably
  // ! Require automating to do quickly enough

  // Data contains piece (x or o) and tile (0 - 8)
  socket.on("takeTurn", async (data) => {
    // If game exists
    if (!games.hasOwnProperty(socket.id)) return;
    // If piece is x or o
    if (!(data.piece === "x" || data.piece === "o")) return;
    // If it is current turn
    if (games[socket.id].currentTurn !== data.piece) return;
    // If tile is valid type
    if (typeof data.tile !== "number" || data.tile < 0 || data.tile > 8) return;
    // If tile is empty
    if (
      games[socket.id].board[data.tile] === "x" ||
      games[socket.id].board[data.tile] === "o"
    )
      return;

    // Set Piece in Tile
    games[socket.id].board[data.tile] = data.piece;
    // Check for terminal board state
    let result = isBoardTerminal(games[socket.id].board);
    // If the player won, send the flag
    if (result === "x") {
      io.to(socket.id).emit("gameOver", {
        winner: result,
        flag: FLAG,
      });

      delete games[socket.id];
      return;
    } else if (result) {
      io.to(socket.id).emit("gameOver", {
        winner: result,
      });

      delete games[socket.id];
      return;
    }

    // Invert current turn
    if (games[socket.id].currentTurn === "x") {
      games[socket.id].currentTurn = "o";
    } else {
      games[socket.id].currentTurn = "x";
    }

    // AI waits for 2s before taking turn,
    // This could cause some weird behaviour if the client does not
    // Wait for the 'piecePlaced' message before taking their next turn
    // Therefore the whole game should be completed before this ever gets called,
    await sleep(2000);

    // Check if game still exists by this point, after winning the game will be removed
    if (!games.hasOwnProperty(socket.id)) return;
    if (games[socket.id].currentTurn !== "o") return;
    // Calculate next move with minimax algorithm
    const nextMove = ComputerMove(games[socket.id].board, symbols, difficulty);
    // Take ai turn
    games[socket.id].board[nextMove] = "o";
    // Emit the piece placed to opposing player
    io.to(socket.id).emit("piecePlaced", {
      piece: "o",
      tile: nextMove,
    });
    // Check for terminal board state
    result = isBoardTerminal(games[socket.id].board);
    if (result) {
      io.to(socket.id).emit("gameOver", {
        winner: result,
      });

      delete games[socket.id];
      return;
    }
    // Set turn to player
    games[socket.id].currentTurn = "x";
  });
  // Delete game on disconnect
  socket.on("disconnect", () => {
    delete games[socket.id];
  });
});

// Sleep helper function
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Checks if a given board is in a terminal state (draw, win, loss, false)
function isBoardTerminal(board) {
  function empty() {
    return board.every((cell) => {
      return cell !== "x" && cell !== "o";
    });
  }

  function full() {
    return board.every((cell) => {
      return cell === "x" || cell === "o";
    });
  }

  function areTilesSame(tileA, tileB) {
    return board[tileA] === board[tileB];
  }

  if (empty()) return false;

  // Rows
  if (areTilesSame(0, 1) && areTilesSame(0, 2) && board[0]) return board[0];
  if (areTilesSame(3, 4) && areTilesSame(3, 5) && board[3]) return board[3];
  if (areTilesSame(6, 7) && areTilesSame(6, 8) && board[6]) return board[6];
  // Columns
  if (areTilesSame(0, 3) && areTilesSame(0, 6) && board[0]) return board[0];
  if (areTilesSame(1, 4) && areTilesSame(1, 7) && board[1]) return board[1];
  if (areTilesSame(2, 5) && areTilesSame(2, 8) && board[2]) return board[2];
  // Diagonals
  if (areTilesSame(0, 4) && areTilesSame(0, 8) && board[0]) return board[0];
  if (areTilesSame(2, 4) && areTilesSame(2, 6) && board[2]) return board[2];

  if (full()) return "draw";

  return false;
}