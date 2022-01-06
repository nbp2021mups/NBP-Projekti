require("dotenv").config();
const path = require("path");
const http = require('http');
const express = require("express");
const socketIO = require("socket.io");
const dateTime = require("date-fns");

const app = express();
app.use(express.static(path.join("backend/public")));

const hostname = process.env.SOCKET_SERVER_HOSTNAME;
const port = process.env.SOCKET_SERVER_PORT;

const server = http.createServer(app);
const io = new socketIO.Server(server);

const online = {};

io.on("connection", socket => {
    console.log(`Client ${socket.id} connected`);
    socket.emit("connected");

    socket.on("join", data => {
        if (data["username"]) {
            console.log("Join", data["username"]);
            online[data["username"]] = socket;
            socket.username = data["username"];
            socket.emit("joined", data);
        } else {
            console.log("Invalid data format!");
            socket.emit("error", { message: "Invalid data format", content: data })
        }
    });

    socket.on("disconnect", data => {
        if (socket.username) {
            console.log("Disconnect", socket.username);
            online[socket.username] = null;
        }
    });

    socket.on("message", data => {
        if (data["to"] && data["from"] && data["content"] && data["time_sent"]) {
            console.log("Message", data);
            if (online[data["to"]]) {
                online[data["to"]].emit("message", data);
                data["time_received"] = new Date();
            } else
                console.log("User is offline!");
            socket.emit("message-sent", data);
        } else {
            console.log("Invalid data format!");
            socket.emit("error", { message: "Invalid data format", content: data })
        }
    });
});

server.listen({
    host: hostname,
    port: port
}, () => {
    console.log(`Socket server listening on port http://${hostname}:${port}`)
});

module.exports = io;