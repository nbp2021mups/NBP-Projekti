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
const { getDuplicatedClient, getConnection } = require("./backend/redisclient");

const app = express();

const hostname = process.env.SOCKET_SERVER_HOSTNAME;
const port = process.env.SOCKET_SERVER_PORT;

const server = http.createServer(app);
const io = new socketIO.Server(server, {
    cors: {
        origin: "*",
    },
});

const notifyUpdates = (data) => {
    try {
        if (data.to != data.from) {
            let forUser = online[data["to"]];
            if (forUser) {
                switch (forUser.view.notifications) {
                    case "notification-tab":
                        forUser.emit("new-notification-in-notifications", {
                            content: data,
                        });
                        break;
                    default:
                        forUser.emit("new-notification-pop-up", {
                            content: data,
                        });
                        break;
                }
            }
        }
    } catch (ex) {
        console.log(ex);
    }
};

const sendMessage = (data) => {
    let forUser = online[data["to"]];
    if (forUser) {
        switch (forUser.view.messages) {
            case "messages-tab":
                forUser.emit("new-message-in-messages", {
                    content: data,
                });
                break;
            default:
                forUser.emit("new-message-pop-up", { content: data });
                break;
        }
    }
};

const readMessages = (data) => {
    let fromUser = online[data["from"]];
    if (fromUser) {
        fromUser.emit("read-messages", {
            content: data,
        });
    }
};

const subscribeToUpdates = async(socket) => {
    const redisDuplicate = await getDuplicatedClient();

    await redisDuplicate.subscribe(
        `user-updates:${socket.username}`,
        async(update) => {
            const u = JSON.parse(update);
            switch (u.type) {
                case "new-notification":
                    notifyUpdates(u.payload);
                    break;
                case "new-message":
                    sendMessage(u.payload);
                    break;
                case "read-messages":
                    readMessages(u.payload);
                    break;
            }
        }
    );

    await redisDuplicate.subscribe(
        `followed-location:${socket.username}`,
        async(loc) => {
            await redisDuplicate.subscribe("location:" + loc, (message) => {
                const m = JSON.parse(message);
                if (socket.username != m.from) {
                    notifyUpdates({
                        id: 0,
                        from: m.text,
                        to: socket.username,
                        content: locId,
                        timeSent: new Date().toString(),
                        type: "new-post-on-location",
                    });
                }
            });
        }
    );

    await redisDuplicate.subscribe(
        `unfollow-location:${socket.username}`,
        async(loc) => {
            await redisDuplicate.unsubscribe("location:" + loc);
        }
    );

    const chyper = `MATCH (l:Location)<-[:FOLLOWS]-(u:User)
          WHERE u.username=$username
          RETURN ID(l)`;

    const locations = await driver.session().run(chyper, {
        username: socket.username,
    });
    if (locations.records.length > 0) {
        locations.records.forEach(async(record) => {
            const locId = record.get("ID(l)").low;
            await redisDuplicate.subscribe("location:" + locId, (message) => {
                const m = JSON.parse(message);
                if (socket.username != m.from)
                    notifyUpdates({
                        id: 0,
                        from: m.text,
                        to: socket.username,
                        content: locId,
                        timeSent: new Date().toString(),
                        type: "new-post-on-location",
                    });
            });
        });
    }

    return redisDuplicate;
};

const storeMessage = async(msg) => {
    const cypher = `MATCH (c:Chat)
                    WHERE id(c)=$chatId
                    MERGE (c)-[:HAS]->(m:Message{
                        chatId: $chatId,
                        from: $from,
                        to: $to,
                        content: $content,
                        timeSent: $timeSent,
                        read: $read
                    })
                    SET c.topMessageFrom=$from, c.topMessageTimeSent=$timeSent, c.topMessageContent=$content, c.unreadCount=c.unreadCount+1
                    RETURN id(m)`;
    const result = await driver.session().run(cypher, {
        chatId: msg.chatId,
        from: msg.from,
        to: msg.to,
        content: msg.content,
        timeSent: new Date(msg.timeSent).toString(),
        read: msg.read,
    });
    if (result.records.length > 0) {
        msg["id"] = result.records[0].get(0).low;

        getConnection().then((redis) => {
            redis.publish(
                `user-updates:${msg.to}`,
                JSON.stringify({ type: "new-message", payload: msg })
            );
        });
    }
};

const updateMessages = async(data) => {
    const cypher = `MATCH (c:Chat)-[:HAS]->(m:Message)
                    WHERE id(c)=$chatId AND NOT m.read AND m.from=$from
                    SET c.unreadCount=0, m.read=true`;
    await driver.session().run(cypher, data);
    getConnection().then((redis) =>
        redis.publish(
            `user-updates:${data.from}`,
            JSON.stringify({ type: "read-messages", payload: data })
        )
    );
};

const close = async(socket, redisDup) => {
    if (socket.username) {
        online[socket.username] = null;
        socket.username = null;
        socket.view = null;
        await redisDup.disconnect();
    }
};

// Users that are online
const online = {};

io.on("connection", (socket) => {
    try {
        let redisDup = null;
        socket.emit("connected", { content: socket.id });

        socket.on("join", async(data) => {
            try {
                if (data["username"] && data["view"]) {
                    if (socket.username) {
                        online[socket.username] = null;
                    }

                    socket.username = data["username"];
                    socket.view = data["view"];
                    online[socket.username] = socket;
                    socket.emit("joined", { content: data });

                    subscribeToUpdates(socket).then(
                        (redisDuplicate) => (redisDup = redisDuplicate)
                    );
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
                close(socket, redisDup);
            } catch (ex) {
                socket.emit("error", { message: ex, content: {} });
            }
        });

        socket.on("disconnect", async() => {
            try {
                close(socket, redisDup);
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