const validateSentMessage = (data) => {
    return data["from_user"] && data["for_user"] && data["chat_id"] && data["time_sent"] && data["content_type"] && data["content"];
};

const validateReadMessages = (data) => {
    return data["from_user"] && data["for_user"] && data["chat_id"];
};

const validateNotification = (data) => {
    return data["for_user"] && data["type"] && data["content"] && data["time_created"];
};

const validatePostLike = (data) => {
    data["type"] = "post-like";
    return data["from_user"] && validateNotification(data);
};

const validatePostComment = (data) => {
    data["type"] = "post-comment";
    return data["from_user"] && validateNotification(data);
};

const validateSendFriendRequest = (data) => {
    data["type"] = "friend-request";
    return data["from_user"] && validateNotification(data);
};

const validateAcceptFriendRequest = (data) => {
    data["type"] = "accepted-friend-request";
    return data["from_user"] && validateNotification(data);
};

module.exports = {
    validateSentMessage,
    validateReadMessages,
    validateNotification,
    validatePostLike,
    validatePostComment,
    validateSendFriendRequest,
    validateAcceptFriendRequest
};