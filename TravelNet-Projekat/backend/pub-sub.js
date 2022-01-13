const { getConnection, getDuplicatedClient } = require("./redisclient");
const driver = require("./neo4jdriver");

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
                    timeSent: new Date().toString(),
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
                            timeSent: new Date().toString(),
                            type: "new-post-on-location",
                        },
                        socket
                    );
            });
        });
    }
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
    const result = await sesdriver.session().run(cypher, {
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