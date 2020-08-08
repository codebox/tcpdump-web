const socket = new WebSocket('ws://localhost:3000/ws');

// Connection opened
socket.addEventListener('open', function (event) {
    console.log('opened',socket.readyState)
});

// Listen for messages
socket.addEventListener('message', function (event) {
    console.log('Message from server ', event.data);
});

