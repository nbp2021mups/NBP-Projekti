require("dotenv").config();
const path = require("path");
const http = require('http');
const express = require("express");
const socketIO = require("socket.io");

const app = express();
app.use(express.static(path.join("backend/public")));

const hostname = process.env.SOCKET_SERVER_HOSTNAME;
const port = process.env.SOCKET_SERVER_PORT;

const server = http.createServer(app);
const io = new socketIO.Server(server);

module.exports = io;

server.listen({
    host: hostname,
    port: port
}, () => {
    console.log(`Socket server listening on port http://${hostname}:${port}`)
});