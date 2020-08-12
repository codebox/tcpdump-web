const express = require('express'),
    enableWs = require('express-ws'),
    readline = require('readline'),
    parser = require('./tcpdumpParser'),
    os = require('os');

const PORT = 3000;


const rl = readline.createInterface({
    input: process.stdin
});

rl.on('line', (inputLine) => {
    const parsedInput = JSON.stringify(parser.parse(inputLine));
    if (parsedInput) {
        webSockets.forEach(ws => ws.send(parsedInput));
    } else {
        console.warn('Unable to parse line', inputLine);
    }
});

const app = express();
enableWs(app);

const webSockets = new Set();
app.ws('/ws', (ws, req) => {
    console.log('ws opened');
    webSockets.add(ws);

    ws.on('close', () => {
        console.log('ws closed');
        webSockets.delete(ws);
    })
});

app.get('/local', (req, res) => {
    const localAddresses = Object.values(os.networkInterfaces()).flatMap(o=>o).map(o => o.address);
    res.send(localAddresses)
});

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`)
});

app.use(express.static('web'));
