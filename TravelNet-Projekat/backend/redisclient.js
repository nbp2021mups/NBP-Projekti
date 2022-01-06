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
}

module.exports = {
    client: getConnection()
};