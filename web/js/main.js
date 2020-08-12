const socket = new WebSocket('ws://localhost:3000/ws');

fetch('//localhost:3000/local')
    .then(response => response.json())
    .then(data => model.setLocal(data));

// Connection opened
socket.addEventListener('open', function (event) {
    console.log('opened',socket.readyState)
});

// Listen for messages
socket.addEventListener('message', function (event) {
    const msg = JSON.parse(event.data);
    if (msg.type === 'tcp') {
        model.tcp(msg.srcHost, msg.srcPort, msg.dstHost, msg.dstPort);
    } else if (msg.type === 'udp') {
        model.udp(msg.srcHost, msg.srcPort, msg.dstHost, msg.dstPort);
    } else {
        console.log(msg)
    }

});

setInterval(() => {
    "use strict";
    view.update(model);
}, 1000)

setInterval(() => {
    "use strict";
    model.expire();
}, 5000)

