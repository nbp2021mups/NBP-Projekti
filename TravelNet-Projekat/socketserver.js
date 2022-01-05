const path = require("path");
const http = require('http');
const express = require("express");
const socketIO = require("socket.io");

const app = express();
app.use(express.static(path.join("backend/public")));

const hostname = "localhost";
const port = 5050;

const server = http.createServer(app);
const io = socketIO(server);

io.on("connection", client => {
    console.log(`Client ${client.hostname} connected`);
    client.emit("message", { message: "Welcome!" });

});

server.listen({
    host: hostname,
    port: port
}, () => {
    console.log(`Socket server listening on port http://${hostname}:${port}`)
});