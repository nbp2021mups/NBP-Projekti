const express = require('express');
const server = express();
const port = 3000;

server.get('/', (req, res) => {
    res.send('Testing!')
});

server.listen(port, () => {
    console.log(`Serving on http://localhost:${port}`)
});