const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname , '../public');

const app = express();
// if we don't do this the express library does this behind the scene anyway
// we do this to pass server as param to socketio 
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(publicDirectoryPath));


// socket has information about any new connection
io.on('connection' , (socket) => {
    console.log('New webSocket connection');

    io.emit('message' , 'Welcome!');

    socket.on('sendMessage' , (message) => {
        io.emit('message' , message);
    });
})

server.listen(port , () => {
    console.log(`Server is up on port ${port}`);
})