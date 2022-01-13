require("dotenv").config();
const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const driver = require("./backend/neo4jdriver");
const {
    validateSentMessage,
    validateReadMessages,
} = require("./backend/validation/socketValidations");
const {
    closeSession,
    updateMessages,
    storeMessage,
    subscribeToUpdates,
    actions,
} = require("./backend/pub-sub");

const app = express();

const hostname = process.env.SOCKET_SERVER_HOSTNAME;
const port = process.env.SOCKET_SERVER_PORT;

const server = http.createServer(app);
const io = new socketIO.Server(server, {
    cors: {
        origin: "*",
    },
});

io.on("connection", (socket) => {
    try {
        socket.emit("connected", { content: socket.id });

        socket.on("join", async(data) => {
            try {
                if (data["username"] && data["view"]) {
                    if (socket.username) {
                        closeSession(socket);
                    }

                    socket.username = data["username"];
                    socket.view = data["view"];
                    subscribeToUpdates(socket).then(() => {
                        socket.emit("joined", { content: data });
                    });
                } else {
                    socket.emit("error", {
                        message: "Invalid parameters!",
                        content: data,
                    });
                }
            } catch (ex) {
                socket.emit("error", { message: ex, content: data });
            }
        });

        socket.on("change-view", (data) => {
            try {
                if (data.view) {
                    if (socket.username) {
                        if (data.view.notifications != null)
                            socket.view.notifications = data.view.notifications;
                        if (data.view.messages != null)
                            socket.view.messages = data.view.messages;
                    } else {
                        socket.emit("error", {
                            message: "User not logged in!",
                            content: data,
                        });
                    }
                } else {
                    socket.emit("error", { message: "View not defined!", content: data });
                }
            } catch (ex) {
                socket.emit("error", { message: ex, content: data });
            }
        });

        socket.on("logout", async() => {
            try {
                closeSession(socket);
            } catch (ex) {
                socket.emit("error", { message: ex, content: {} });
            }
        });

        socket.on("disconnect", async() => {
            try {
                closeSession(socket);
            } catch (ex) {
                socket.emit("error", { message: ex, content: {} });
            }
        });

        socket.on("send-message", async(data) => {
            try {
                if (socket.username) {
                    if (validateSentMessage(data)) {
                        await storeMessage(data);
                    } else {
                        socket.emit("error", {
                            message: "Incorrect message format!",
                            content: data,
                        });
                    }
                } else {
                    socket.emit("error", {
                        message: "User not logged in!",
                        content: data,
                    });
                }
            } catch (ex) {
                socket.emit("error", { message: ex, content: data });
            }
        });

        socket.on("read-messages", (data) => {
            try {
                if (socket.username) {
                    if (validateReadMessages(data)) {
                        if (data["unreadCount"] > 0) {
                            updateMessages(data);
                        }
                    } else {
                        socket.emit("error", {
                            message: "Invalid message format!",
                            content: data,
                        });
                    }
                } else {
                    socket.emit("error", {
                        message: "User not logged in!",
                        content: data,
                    });
                }
            } catch (ex) {
                socket.emit("error", { message: ex, content: data });
            }
        });
    } catch (ex) {
        console.log(ex);
    }
});

server.listen({
        host: hostname,
        port: port,
    },
    () =>
    console.log(`Socket server listening on port http://${hostname}:${port}`)
);