const { int } = require("neo4j-driver");
const driver = require("../neo4jdriver");
const router = require("express").Router();
const {
    lRangeMessage,
    rPushMessage,
    lSetMessage,
    getConnection,
} = require("./../redisclient");
const { validateNewMessage } = require("./../validation/messageValidation");

const session = driver.session();

// Routes
router.get("/:chatId/:startIndex/:count", async(req, res) => {
    try {
        req.params.count = parseInt(req.params.count);
        req.params.startIndex = parseInt(req.params.startIndex);

        const redisClient = await getConnection();
        let result = await redisClient.lRange(
            `unread-messages:chat:${req.params.chatId}`, -req.params.count - req.params.startIndex, -req.params.startIndex - 1
        );

        if (result) {
            result = result.map((x) => JSON.parse(x));
            if (result.length == req.params.count) {
                return res.send(result);
            }
            req.params.count -= result.length;
        } else result = [];
        const cypher = `MATCH (c:Chat)-[:HAS]->(m:Message)
                        WHERE id(c) = $chatId
                        RETURN m
                        ORDER BY m.timeSent DESC
                        SKIP $startIndex
                        LIMIT $count`;
        const params = {
            chatId: int(req.params.chatId),
            startIndex: int(req.params.startIndex),
            count: int(req.params.count),
        };

        const unparsedResult = await session.run(cypher, params);
        unparsedResult.records.forEach((r) => {
            result.push({
                id: r.get("m").identity.low,
                ...r.get("m").properties,
                chatId: r.get("m").properties.chatId.low,
            });
        });
        return res.send(result);
    } catch (error) {
        console.log(error);
        return res.status(401).send("Došlo je do greške");
    }
});

router.post("/", async(req, res) => {
    try {
        return res.send("OK");
    } catch (error) {
        console.log(error);
        res.status(401).send("Došlo je do greške");
    }
});

router.put("/", async(req, res) => {
    try {
        return res.send("ok");
    } catch (error) {
        console.log(error);
        res.status(401).send("Došlo je do greške");
    }
});

router.patch("/", async(req, res) => {
    try {} catch (error) {
        console.log(error);
        res.status(401).send("Došlo je do greške");
    }
});

router.delete("/", async(req, res) => {
    try {} catch (error) {
        console.log(error);
        res.status(401).send("Došlo je do greške");
    }
});

module.exports = router;