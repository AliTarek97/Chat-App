const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

const app = express();
// if we don't do this the express library does this behind the scene anyway
// we do this to pass server as param to socketio
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(publicDirectoryPath));

// socket has information about any new connection
// connection and disconnect are built in connections
io.on("connection", (socket) => {
  console.log("New webSocket connection");

  socket.on("join", ({ username, room }) => {
    socket.join(room);
    socket.emit("message", generateMessage("Welcome!"));
    // it will emit to everbody except that particular connection
    socket.broadcast
      .to(room)
      .emit("message", generateMessage(`${username} has joined!`));
  });

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }
    io.emit("message", generateMessage(message));
    callback();
  });

  socket.on("sendLocation", (coords, callback) => {
    io.emit(
      "locationMessage",
      generateLocationMessage(
        `https://google.com/maps/?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    //we user io.emit because I have been already disconnected
    io.emit("message", generateMessage("A user has left"));
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
