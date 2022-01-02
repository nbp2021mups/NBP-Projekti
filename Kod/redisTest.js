const Redis = require('ioredis');
const client = new Redis({
    port: 13049,
    host: 'redis-13049.c282.east-us-mz.azure.cloud.redislabs.com',
    password: "asVdJ1yzjDOjigcLA18tpML1ZwWUYONx",
});

client.set("Stef", 'val1');

client.get("Stef", (err, result) => {
    if (err) {
        console.error(err);
    } else {
        console.log(result);
    }
});

client.zadd("sortedSet", 1, "one", 2, "dos", 4, "quatro", 3, "three");
client.zrange("sortedSet", 0, 2, "WITHSCORES").then((res) => console.log(res));

client.set("key", 100, "EX", 10);