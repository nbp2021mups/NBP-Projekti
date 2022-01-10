const driver = require("../neo4jdriver");
const router = require("express").Router();
const {
    lRangeMessage,
    rPushMessage,
    lSetMessage,
} = require("./../redisclient");
const { validateNewMessage } = require("./../validation/messageValidation");

const session = driver.session();

// Routes
router.get("/:chatId/:startIndex/:count", async(req, res) => {
    try {
        const result = await lRangeMessage(
            req.params.chatId,
            parseInt(req.params.startIndex),
            parseInt(req.params.count)
        );
        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(401).send("Došlo je do greške");
    }
});

router.post("/", async(req, res) => {
    try {
        if (!validateNewMessage(req.body))
            return res.status(401).send("Nevalidna struktura poruke!");

        const result = await rPushMessage(
            req.body.chatId,
            req.body.from,
            req.body.to,
            req.body.content,
            req.body.timeSent,
            req.body.timeRead
        );

        res.send(result);
    } catch (error) {
        console.log(error);
        res.status(401).send("Došlo je do greške");
    }
});

router.put("/", async(req, res) => {
    try {
        if (!req.body.id || req.body.chatId)
            return res.status(401).send("Došlo je do greške");

        lRangeMessage(req.body.chatId, req.body.id, 1).then((result) => {
            lSetMessage(result.chatId, result.id, {
                ...result,
                content: req.body.content ? req.body.content : result.content,
                timeRead: req.body.timeRead ? req.body.timeRead : result.timeRead,
            }).then(() => {
                res.send("Ažurirano");
            });
        });
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