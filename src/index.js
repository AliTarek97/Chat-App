const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser,
} = require("./utils/user");

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

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) return callback(error);
    // we are using user to make sure that we are using the same
    // data that are stored is users array
    socket.join(user.room);
    socket.emit("message", generateMessage("Admin", "Welcome!"));
    // it will emit to everbody except that particular connection
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage(user.username, `${user.username} has joined!`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }
    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });

  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps/?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      //we user io.emit because I have been already disconnected
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
