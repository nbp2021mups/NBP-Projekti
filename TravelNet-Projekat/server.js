require("dotenv").config();
const http = require('http');
const app = require('./backend/app');

const hostname = process.env.SERVER_HOSTNAME;
const port = process.env.SERVER_PORT;

const server = http.createServer(app);

server.listen({
    host: hostname,
    port: port
}, () => {
    console.log(`Server listening on port http://${hostname}:${port}`)
});