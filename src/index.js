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

let count = 0 ;

// socket has information about any new connection
io.on('connection' , (socket) => {
    console.log('New webSocket connection');

    //emitting 'countUpdated' event from the server
    //any other param which is count in this case will be 
    //captured on the client side using callback function
    socket.emit('countUpdated' , count);

    socket.on('increment' , () => {
        count++;
        // every time a client joined all clients will get the count data
        // instead of socket.emit
        io.emit('countUpdated' , count);
    })
})

server.listen(port , () => {
    console.log(`Server is up on port ${port}`);
})