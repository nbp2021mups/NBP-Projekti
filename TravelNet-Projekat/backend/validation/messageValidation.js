const validateNewMessage = (message) => {
    return (
        message["from"] &&
        message["to"] &&
        message["content"] &&
        message["timeSent"] &&
        message["chatId"]
    );
};

module.exports = { validateNewMessage };