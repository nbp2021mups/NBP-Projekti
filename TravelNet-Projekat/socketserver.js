require("dotenv").config();
const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const driver = require("./backend/neo4jdriver");
const { int } = require("neo4j-driver");
const {
    validateSentMessage,
    validateReadMessages,
} = require("./backend/validation/socketValidations");
const { getDuplicatedClient, getConnection } = require("./backend/redisclient");
const { ms } = require("date-fns/locale");

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

const notifyUpdates = async(data) => {
    try {
        const cypher = `MATCH (u:User{username:$to})
                        MERGE (u)-[r:HAS]->(n:Notification{
                            from: $from,
                            to: $to,
                            timeSent: $timeSent,
                            read: $read,
                            content: $content,
                            type: $type
                        })
                        RETURN n`;
        driver
            .session()
            .run(cypher, {
                read: false,
                ...data,
            })
            .then((result) => {
                const parsedResult = {
                    id: result.records[0].get("n").identity.low,
                    ...result.records[0].get("n").properties,
                };
                let forUser = online[data["to"]];
                if (forUser) {
                    switch (forUser.view) {
                        case "notification-tab":
                            forUser.emit("new-notification-in-notifications", {
                                content: parsedResult,
                            });
                            break;
                        default:
                            forUser.emit("new-notification-pop-up", {
                                content: parsedResult,
                            });
                            break;
                    }
                }
            });
    } catch (ex) {
        console.log(ex);
    }
};

const subscribeToUpdates = async(socket) => {
    const redisDuplicate = await getDuplicatedClient();

    redisDuplicate.subscribe(
        [
            `post-like:${socket.username}`,
            `post-comment:${socket.username}`,
            `sent-friend-request:${socket.username}`,
            `accepted-friend-request:${socket.username}`,
        ],
        (message) => {
            notifyUpdates(JSON.parse(message));
        }
    );

    redisDuplicate.subscribe(`followed-location:${socket.username}`, (loc) => {
        redisDuplicate.subscribe("location:" + loc, (message) => {
            notifyUpdates({
                id: 0,
                from: message,
                to: socket.username,
                content: locId,
                timeSent: new Date().toString(),
                type: "new-post-on-location",
            });
        });
    });

    const chyper = `MATCH (l:Location)<-[:FOLLOWS]-(u:User)
          WHERE u.username=$username
          RETURN ID(l)`;

    const locations = await driver.session().run(chyper, {
        username: socket.username,
    });
    if (locations.records.length > 0) {
        locations.records.forEach((record) => {
            const locId = int(record.get("ID(l)").low);
            redisDuplicate.subscribe("location:" + locId, (message) => {
                notifyUpdates({
                    id: 0,
                    from: message,
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
        timeSent: msg.timeSent,
        read: msg.read,
    });
    if (result.records.length > 0) {
        msg["id"] = result.records[0].get(0).low;

        getConnection().then((redis) => {
            redis.rPush(`chat:${msg["chatId"]}`, JSON.stringify(msg));
        });
    }
    return msg;
};

const readMessages = async(data) => {
    const cypher = `MATCH (c:Chat)-[:HAS]->(m:Message)
                    WHERE id(c)=$chatId AND NOT m.read AND m.from=$from
                    SET c.unreadCount=0, m.read=true`;
    await driver.session().run(cypher, data);
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
                if (data["view"]) {
                    if (socket.username) {
                        socket.view = data["view"];
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

        socket.on("disconnect", () => {
            try {
                if (socket.username) {
                    online[socket.username] = null;
                    socket.username = null;
                    socket.view = null;
                }
            } catch (ex) {
                socket.emit("error", { message: ex, content: data });
            }
        });

        socket.on("send-message", async(data) => {
            try {
                if (socket.username) {
                    if (validateSentMessage(data)) {
                        storeMessage(data).then((result) => {
                            let forUser = online[result["to"]];
                            if (forUser) {
                                switch (forUser.view) {
                                    case "messages-tab":
                                        forUser.emit("new-message-in-messages", {
                                            content: result,
                                        });
                                        break;
                                    default:
                                        forUser.emit("new-message-pop-up", { content: result });
                                        break;
                                }
                            }
                        });
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
                            let fromUser = online[data["from"]];
                            if (fromUser) {
                                fromUser.emit("read-messages", {
                                    content: data,
                                });
                            }
                            // lRangeMessage(data["chatId"], -data["unreadCount"], 0).then(
                            //     (res) => {
                            //         res.forEach((x) => {
                            //             lSetMessage(x["chatId"], x["id"], {
                            //                 ...x,
                            //                 timeRead: data["timeRead"],
                            //             });
                            //         });
                            //     }
                            // );
                            readMessages(data);
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