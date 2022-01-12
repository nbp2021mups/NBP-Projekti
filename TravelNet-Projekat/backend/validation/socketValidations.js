const validateSentMessage = (data) => {
    return (
        data["from"] &&
        data["to"] &&
        data["chatId"] &&
        data["timeSent"] &&
        data["content"]
    );
};

const validateReadMessages = (data) => {
    return data["from"] && data["chatId"];
};

const validateNotification = (data) => {
    return data["from"] && data["to"] && data["content"] && data["timeSent"];
};

const validatePostLike = (data) => {
    data["type"] = "post-like";
    return validateNotification(data);
};

const validatePostComment = (data) => {
    data["type"] = "post-comment";
    return validateNotification(data);
};

const validateSendFriendRequest = (data) => {
    data["type"] = "sent-friend-request";
    return validateNotification(data);
};

const validateAcceptFriendRequest = (data) => {
    data["type"] = "accepted-friend-request";
    return validateNotification(data);
};

module.exports = {
    validateSentMessage,
    validateReadMessages,
    validateNotification,
    validatePostLike,
    validatePostComment,
    validateSendFriendRequest,
    validateAcceptFriendRequest,
};