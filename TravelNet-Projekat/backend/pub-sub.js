const { getConnection, getDuplicatedClient } = require("./redisclient");
const driver = require("./neo4jdriver");
const { int } = require("neo4j-driver");

const notifyUpdates = (data, socket) => {
    try {
        if (data.to != data.from) {
            if (socket.username) {
                switch (socket.view.notifications) {
                    case "notification-tab":
                        socket.emit("new-notification-in-notifications", {
                            content: data,
                        });
                        break;
                    default:
                        socket.emit("new-notification-pop-up", {
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

const sendMessage = (data, socket) => {
    if (socket.username) {
        switch (socket.view.messages) {
            case "messages-tab":
                socket.emit("new-message-in-messages", {
                    content: data,
                });
                break;
            default:
                socket.emit("new-message-pop-up", { content: data });
                break;
        }
    }
};

const readMessages = (data, socket) => {
    if (socket.username) {
        socket.emit("read-messages", {
            content: data,
        });
    }
};

const followLocation = async(loc, socket) => {
    await socket.redisClient.subscribe("location:" + loc, (message) => {
        const m = JSON.parse(message);
        if (socket.username != m.from) {
            notifyUpdates({
                    id: 0,
                    from: m.text,
                    to: socket.username,
                    content: m.locationId,
                    timeSent: new Date().toUTCString(),
                    type: "new-post-on-location",
                },
                socket
            );
        }
    });
};

const unfollowLocation = async(loc, socket) => {
    await socket.redisClient.unsubscribe("location:" + loc);
};

const subscribeToUpdates = async(socket) => {
    socket.redisClient = await getDuplicatedClient();

    await socket.redisClient.subscribe(
        `user-updates:${socket.username}`,
        async(update) => {
            const u = JSON.parse(update);
            actions[u.type](u.payload, socket);
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
            await socket.redisClient.subscribe("location:" + locId, (message) => {
                const m = JSON.parse(message);
                if (socket.username != m.from)
                    notifyUpdates({
                            id: 0,
                            from: m.text,
                            to: socket.username,
                            content: m.locationId,
                            timeSent: new Date().toUTCString(),
                            type: "new-post-on-location",
                        },
                        socket
                    );
            });
        });
    }
};

const storeMessage = async(msg) => {
    const redisClient = await getConnection();
    const msgString = JSON.stringify({
        ...msg,
        timeSent: new Date().toISOString(),
    });
    await redisClient.lPush(`unread-messages:chat:${msg.chatId}`, msgString);
    await redisClient.publish(
        `user-updates:${msg.to}`,
        JSON.stringify({ type: "new-message", payload: msg })
    );
    const cypher = `MATCH (c:Chat)
                    WHERE id(c)=$chatId
                    SET c.topMessageFrom=$from,
                    c.topMessageTo=$to,
                    c.topMessageTimeSent=datetime(),
                    c.topMessageContent=$content,
                    c.unreadCount=c.unreadCount+1`;
    await driver.session().run(cypher, {
        chatId: int(msg.chatId),
        from: msg.from,
        to: msg.to,
        content: msg.content,
    });
};

const updateMessages = async(data) => {
    const redisClient = await getConnection();
    const result = await redisClient.sendCommand([
        "LPOP",
        `unread-messages:chat:${data.chatId}`,
        String(data["unreadCount"]),
    ]);
    if (!result) return;
    const cypher = `MATCH (c:Chat)
                    WHERE id(c)=$chatId
                    SET c.unreadCount=0
                    WITH c
                    UNWIND $props AS map
                    CREATE (c)-[:HAS]->(m:Message)
                    SET m = map
                    SET m.timeSent=datetime(map.timeSent)
                    RETURN m`;
    await driver.session().run(cypher, {
        chatId: int(data["chatId"]),
        props: result.map((x) => {
            const parsed = JSON.parse(x);
            return {
                from: parsed.from,
                to: parsed.to,
                chatId: int(parsed.chatId),
                content: parsed.content,
                timeSent: parsed.timeSent,
                read: true,
            };
        }),
    });
    await redisClient.publish(
        `user-updates:${data.from}`,
        JSON.stringify({ type: "read-messages", payload: data })
    );
};

const closeSession = async(socket) => {
    if (socket.username) {
        socket.username = null;
        socket.view = null;
        await socket.redisClient.disconnect();
    }
};

const actions = {
    "new-notification": notifyUpdates,
    "new-message": sendMessage,
    "read-messages": readMessages,
    "follow-location": followLocation,
    "unfollow-location": unfollowLocation,
};

module.exports = {
    closeSession,
    updateMessages,
    storeMessage,
    subscribeToUpdates,
    actions,
};