const redis = require("redis");

let client = null;
const getConnection = () => {
    if (!client)
        client = redis.createClient({
            host: process.env.REDIS_HOSTNAME,
            port: process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD
        });

    return client;
};

const getChatId = (userId1, userId2) => {
    if (userId1 < userId2)
        return `chat:${userId1}:${userId2}`;
    else
        return `chat:${userId2}:${userId1}`;
};

const getMessageId = (chatId) => {
    return `message:${new Date().toString()}:${chatId}`;
};

module.exports = {
    client: getConnection(),
    getChatId,
    getMessageId
};