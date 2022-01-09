require("dotenv").config();
const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const {
    validateSentMessage,
    validateReadMessages,
    validatePostLike,
    validatePostComment,
    validateSendFriendRequest,
    validateAcceptFriendRequest,
} = require("./backend/validation/socketValidations");
const { exec } = require("child_process");

const app = express();
app.use(express.static(path.join("backend/public")));

const hostname = process.env.SOCKET_SERVER_HOSTNAME;
const port = process.env.SOCKET_SERVER_PORT;

const server = http.createServer(app);
const io = new socketIO.Server(server, {
    cors: {
        origin: "*",
    },
});

// Users that are online
const online = {};

const unread = {
    chats: {},
    notifications: {},
};

io.on("connection", (socket) => {
    try {
        console.log(`Client ${socket.id} connected`);
        socket.emit("connected", { content: socket.id });

        socket.on("join", (data) => {
            try {
                if (data["username"] && data["view"]) {
                    if (socket.username) {
                        console.log("Disconnect", socket.username);
                        online[socket.username] = null;
                    }

                    socket.username = data["username"];
                    socket.view = data["view"];
                    console.log("Join", socket.username);
                    online[socket.username] = socket;
                    socket.emit("joined", { content: data });
                } else {
                    console.log("Invalid parameters!");
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
                if (data["view"]) {
                    if (socket.username) {
                        socket.view = data["view"];
                        console.log("Change-view", socket.username, socket.view);
                    } else {
                        console.log("User not logged in!");
                        socket.emit("error", {
                            message: "User not logged in!",
                            content: data,
                        });
                    }
                } else {
                    console.log("Invalid view!");
                    socket.emit("error", { message: "View not defined!", content: data });
                }
            } catch (ex) {
                socket.emit("error", { message: ex, content: data });
            }
        });

        socket.on("disconnect", () => {
            try {
                if (socket.username) {
                    console.log("Disconnect", socket.username);
                    online[socket.username] = null;
                    socket.username = null;
                    socket.view = null;
                }
            } catch (ex) {
                socket.emit("error", { message: ex, content: data });
            }
        });

        socket.on("send-message", (data) => {
            try {
                if (socket.username) {
                    if (validateSentMessage(data)) {
                        console.log("Send-message", data);
                        let forUser = online[data["to"]];
                        if (forUser) {
                            switch (forUser.view) {
                                case `chat-tab::${data["chatId"]}`:
                                    forUser.emit("new-message-in-chat", { content: data });
                                    break;
                                case "messages-tab":
                                    forUser.emit("new-message-in-messages", { content: data });
                                    break;
                                default:
                                    forUser.emit("new-message-pop-up", { content: data });
                                    break;
                            }
                        } else {
                            console.log("User is offline!");
                        }
                        // Store in database
                        if (!unread["chats"][data["chatId"]])
                            unread["chats"][data["chatId"]] = [];
                        unread["chats"][data["chatId"]].push(data);
                    } else {
                        console.log("Invalid message format!");
                        socket.emit("error", {
                            message: "Incorrect message format!",
                            content: data,
                        });
                    }
                } else {
                    console.log("User not logged in!");
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
                console.log(socket.username, data);
                if (socket.username) {
                    if (validateReadMessages(data)) {
                        console.log("Read-messages", data);
                        let fromUser = online[data["from"]];
                        // Update database
                        if (!unread["chatsId"]) unread["chatsId"] = {};
                        for (let msg of unread["chats"][data["chatId"]])
                            msg["timeRead"] = data["timeRead"];

                        if (fromUser) {
                            fromUser.emit("read-messages", {
                                content: data,
                            });
                        } else {
                            console.log("User is offline!");
                        }
                        unread["chats"][data["chatId"]] = [];
                    } else {
                        console.log("Invalid message format!");
                        socket.emit("error", {
                            message: "Invalid message format!",
                            content: data,
                        });
                    }
                } else {
                    console.log("User not logged in!");
                    socket.emit("error", {
                        message: "User not logged in!",
                        content: data,
                    });
                }
            } catch (ex) {
                socket.emit("error", { message: ex, content: data });
            }
        });

        socket.on("like-post", (data) => {
            try {
                if (socket.username) {
                    if (validatePostLike(data)) {
                        console.log("Like-post");
                        notify(data);
                    } else {
                        console.log("Invalid comment format!");
                        socket.emit("error", {
                            message: "Incorrect comment format!",
                            content: data,
                        });
                    }
                } else {
                    console.log("User not logged in!");
                    socket.emit("error", {
                        message: "User not logged in!",
                        content: data,
                    });
                }
            } catch (ex) {
                socket.emit("error", { message: ex, content: data });
            }
        });

        socket.on("comment-post", (data) => {
            try {
                if (socket.username) {
                    if (validatePostComment(data)) {
                        console.log("Comment-post");
                        notify(data);
                    } else {
                        console.log("Invalid notification format!");
                        socket.emit("error", {
                            message: "Incorrect notification format!",
                            content: data,
                        });
                    }
                } else {
                    console.log("User not logged in!");
                    socket.emit("error", {
                        message: "User not logged in!",
                        content: data,
                    });
                }
            } catch (ex) {
                socket.emit("error", { message: ex, content: data });
            }
        });

        socket.on("send-friend-request", (data) => {
            try {
                if (socket.username) {
                    if (validateSendFriendRequest(data)) {
                        console.log("Send-friend-request", data);
                        notify(data);
                    } else {
                        console.log("Invalid notification format!");
                        socket.emit("error", {
                            message: "Incorrect notification format!",
                            content: data,
                        });
                    }
                } else {
                    console.log("User not logged in!");
                    socket.emit("error", {
                        message: "User not logged in!",
                        content: data,
                    });
                }
            } catch (ex) {
                socket.emit("error", { message: ex, content: data });
            }
        });

        socket.on("accept-friend-request", (data) => {
            try {
                if (socket.username) {
                    if (validateAcceptFriendRequest(data)) {
                        console.log("Accept-friend-request", data);
                        notify(data);
                    } else {
                        console.log("Invalid notification format!");
                        socket.emit("error", {
                            message: "Incorrect notification format!",
                            content: data,
                        });
                    }
                } else {
                    console.log("User not logged in!");
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

function notify(data) {
    try {
        console.log("Notification", data);
        let forUser = online[data["to"]];
        if (forUser) {
            switch (forUser.view) {
                case "notification-tab":
                    forUser.emit("new-notification-in-notifications", { content: data });
                    break;
                default:
                    forUser.emit("new-notification-pop-up", { content: data });
                    break;
            }
        } else {
            console.log("User is offline!");
        }
        // Store in database
    } catch (ex) {
        console.log(ex);
    }
}

server.listen({
        host: hostname,
        port: port,
    },
    () =>
    console.log(`Socket server listening on port http://${hostname}:${port}`)
);