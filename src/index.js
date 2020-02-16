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
// connection and disconnect are built in connections
io.on('connection' , (socket) => {
    console.log('New webSocket connection');

    socket.emit('message' , 'Welcome!');
    // it will emit to everbody except that particular connection
    socket.broadcast.emit('message' , 'A new user has joined!');

    socket.on('sendMessage' , (message) => {
        io.emit('message' , message);
    });

    socket.on('sendLocation' , (position) => {
        io.emit('message' , `https://google.com/maps/?q=${position.latitude},${position.longitude}`);
    })

    socket.on('disconnect' , () => {
        //we user io.emit because I have been already disconnected
        io.emit('message' , 'A user has left')
    });
})

server.listen(port , () => {
    console.log(`Server is up on port ${port}`);
})