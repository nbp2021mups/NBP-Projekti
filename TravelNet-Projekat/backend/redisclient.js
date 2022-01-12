require("dotenv").config();
const redis = require("redis");

let client = null;
let duplicate = null;

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

const rPushMessage = async(chatId, from, to, content, timeSent, timeRead) => {
    const redisClient = await getConnection();
    const key = chatId;
    const messageId = await redisClient.lLen(chatId);
    const value = JSON.stringify({
        id: messageId,
        chatId,
        from,
        to,
        content,
        timeSent,
        timeRead,
    });
    await redisClient.rPush(key, [value]);
    return { messageId };
};

const lRangeMessage = async(chatId, startIndex, stopIndex) => {
    return (
        await (await getConnection()).lRange(chatId, startIndex, stopIndex - 1)
    ).map((x) => JSON.parse(x));
};

const lSetMessage = async(chatId, index, value) => {
    await (await getConnection()).lSet(chatId, index, JSON.stringify(value));
};

const getDuplicatedClient = async() => {
    if (!duplicate) {
        const redisClient = await getConnection();
        duplicate = await redisClient.duplicate();
        await duplicate.connect();

        duplicate.on("unsubscribe", (channel, message) => {
            console.log("Message: " + message + "on channel " + channel);
        });
        duplicate.on("subscribe", (channel, message) => {
            console.log("Message: " + message + "on channel " + channel);
        });
        duplicate.on("message", (channel, message) => {
            console.log("Message: " + message + "on channel " + channel);
        });
    }

    return duplicate;
};

module.exports = {
    getConnection,
    getChatId,
    rPushMessage,
    lRangeMessage,
    lSetMessage,
    getDuplicatedClient,
};