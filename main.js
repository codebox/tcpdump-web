const express = require('express'),
    readline = require('readline');

const PORT = 3000;

const rl = readline.createInterface({
    input: process.stdin
});

const lines = []
rl.on('line', (input) => {
    lines.push(input);
});

const app = express();

app.get('/count', (req, res) => {
    res.send('' + lines.length)
});

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`)
});

app.use(express.static('web'))