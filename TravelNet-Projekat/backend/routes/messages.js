const driver = require("../neo4jdriver");
const router = require("express").Router();
const { getConnection, getMessageId } = require("./../redisclient");
const {
    validateNewMessage,
    validateChatFetch,
} = require("./../validation/messageValidation");

const session = driver.session();

// Routes
router.get("/:chatId/:startIndex/:count", async(req, res) => {
    try {
        const redisClient = await getConnection();
        redisClient
            .lRange(
                req.params.chatId,
                int(req.params.startIndex),
                int(req.params.startIndex) + int(req.params.count)
            )
            .then((data) => {
                console.log(data);
            });
    } catch (error) {
        console.log(error);
        res.status(401).send("Došlo je do greške");
    }
});

router.post("/", async(req, res) => {
    try {
        if (!validateNewMessage(req.body))
            return res.status(401).send("Nevalidna struktura poruke!");

        const messageId = await getMessageId(req.body.chatId);
        const key = req.body.chatId;
        const value = JSON.stringify({
            id: messageId,
            chatId: req.body.chatId,
            from: req.body.from,
            to: req.body.to,
            content: req.body.content,
            timeSent: req.body.timeSent,
            timeRead: req.body.timeRead,
        });
        console.log("Key type:", typeof key, "Value type:", typeof value);

        // const redisClient = await getConnection();

        // const result = await redisClient.sendCommand(["LPUSH", key, [value]]);

        return res.send("1");
    } catch (error) {
        console.log(error);
        return res.status(401).send("Došlo je do greške");
    }
});

router.put("/", async(req, res) => {
    try {} catch (error) {
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