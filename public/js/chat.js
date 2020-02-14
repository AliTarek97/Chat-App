const socket = io(); // helps us to send and recieve events

socket.on('countUpdated' , (count) => {
    console.log('The count has been updated!', count);
})

document.querySelector('#increment').addEventListener('click' , () => {
    console.log('Clicked');
    socket.emit('increment');
})