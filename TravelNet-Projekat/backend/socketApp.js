const io = require("./../socketserver");
const neo4j = require("./neo4jdriver");
const redisClient = require("./redisclient");
const online = {};

io.on("connection", socket => {
    console.log(`Client ${socket.client} connected`);

    socket.on("join", name => {
        console.log("Join", name);
        online[name] = socket;
    });

    socket.on("disconnect", name => {
        console.log("Disconnect", name);
        online[name] = null;
    });

    socket.on("message", data => {
        console.log("Message", data);
        if (online[data["to"]])
            online.emit("message", data);
    });
});

module.exports = online;