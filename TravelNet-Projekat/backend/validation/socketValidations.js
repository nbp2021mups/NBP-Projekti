const validateSentMessage = (data) => {
    return (
        data["from"] &&
        data["to"] &&
        data["chatId"] &&
        data["timeSent"] &&
        data["contentType"] &&
        data["content"]
    );
};

const validateReadMessages = (data) => {
    return data["from"] && data["to"] && data["chatId"];
};

const validateNotification = (data) => {
    return (
        data["from"] &&
        data["to"] &&
        data["type"] &&
        data["content"] &&
        data["timeSent"]
    );
};

const validatePostLike = (data) => {
    data["type"] = "post-like";
    return data["from"] && validateNotification(data);
};

const validatePostComment = (data) => {
    data["type"] = "post-comment";
    return data["from"] && validateNotification(data);
};

const validateSendFriendRequest = (data) => {
    data["type"] = "friend-request";
    return data["from"] && validateNotification(data);
};

const validateAcceptFriendRequest = (data) => {
    data["type"] = "accepted-friend-request";
    return data["from"] && validateNotification(data);
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