require("dotenv").config();
const redis = require("redis");

let client = null;
const getConnection = async() => {
    if (!client) {
        client = redis.createClient({
            url: process.env.REDIS_URL,
            password: process.env.REDIS_PASSWORD,
        });

        await client.connect();
    }

    return client;
};

const getChatId = (userId1, userId2) => {
    if (userId1 < userId2) return `chat:${userId1}:${userId2}`;
    else return `chat:${userId2}:${userId1}`;
};

const getMessageId = (chatId) => {
    return `message:${new Date().toString()}:${chatId}`;
};

module.exports = {
    getConnection,
    getChatId,
    getMessageId,
};