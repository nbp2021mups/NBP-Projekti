console.log("Connecting...");
const socket = io("http://localhost:5050");

socket.on("connected", onConnected);
socket.on("error", onError);
socket.on("joined", onJoined);
socket.on("new-message-in-chat", onNewMessageInChat);
socket.on("new-message-in-messages", onNewMessageInMessages);
socket.on("new-message-pop-up", onNewMessagePopUp);
socket.on("read-messages", onReadMessages);
socket.on("new-notification-in-notifications", onNewNotification);
socket.on("new-notification-pop-up", onNotificationPopUp);

// Logic
let loggedUser = null;
const user = document.body.querySelector("#username");
const view = document.body.querySelector("#view");

const for_user_send_message = document.querySelector("#for-user-send-message");
const chat_id_send_message = document.querySelector("#chat-id-send-message");
const content_type_send_message = document.querySelector(
    "#content-type-send-message"
);
const content_send_message = document.querySelector("#content-send-message");

const from_user_read_messages = document.querySelector(
    "#from-user-read-messages"
);
const chat_id_read_messages = document.querySelector("#chat-id-read-messages");

const for_user_like_post = document.querySelector("#for-user-like-post");
const content_like_post = document.querySelector("#content-like-post");

const for_user_comment_post = document.querySelector("#for-user-comment-post");
const content_comment_post = document.querySelector("#content-comment-post");

const for_user_send_friend_request = document.querySelector(
    "#for-user-send-friend-request"
);
const content_friend_request = document.querySelector(
    "#content-friend-request"
);

const for_user_accept_friend_request = document.querySelector(
    "#for-user-accept-friend-request"
);
const content_accept_friend_request = document.querySelector(
    "#content-accept-friend-request"
);

window.join = () => {
    console.log("joining...");
    socket.emit("join", { username: user.value, view: "home" });
};

window.changeView = () => {
    socket.emit("change-view", { view: view.value });
};

window.sendMessage = () => {
    socket.emit("send-message", {
        from: loggedUser,
        to: for_user_send_message.value,
        chatId: chat_id_send_message.value,
        contentType: content_type_send_message.value,
        content: content_send_message.value,
        timeSent: new Date(),
    });
};

window.readMessages = () => {
    socket.emit("read-messages", {
        to: loggedUser,
        from: from_user_read_messages.value,
        chatId: chat_id_read_messages.value,
    });
};

window.likePost = () => {
    socket.emit("like-post", {
        from: loggedUser,
        to: for_user_like_post.value,
        content: content_like_post.value,
        timeSent: new Date(),
    });
};

window.commentPost = () => {
    socket.emit("comment-post", {
        from: loggedUser,
        to: for_user_comment_post.value,
        content: content_comment_post.value,
        timeSent: new Date(),
    });
};

window.sendFriendRequest = () => {
    socket.emit("send-friend-request", {
        from: loggedUser,
        to: for_user_send_friend_request.value,
        content: content_friend_request.value,
        timeSent: new Date(),
    });
};

window.acceptFriendRequest = () => {
    socket.emit("accept-friend-request", {
        from: loggedUser,
        to: for_user_accept_friend_request.value,
        content: content_accept_friend_request.value,
        timeSent: new Date(),
    });
};
//

// Event handlers
function onConnected() {
    console.log("Connected");
}

function onError(data) {
    console.log("Error", data);
}

function onJoined(data) {
    console.log("Joined", data["content"]);
    loggedUser = data["content"]["username"];
}

function onNewMessageInChat(data) {
    console.log(
        "New message in chat",
        data["content"]["chatId"],
        data["content"]
    );
}

function onNewMessageInMessages(data) {
    console.log("New message in messages", data["content"]);
}

function onNewMessagePopUp(data) {
    console.log("New message pop up", data["content"]);
}

function onReadMessages(data) {
    console.log("Read messages", data["content"]);
}

function onNewNotification(data) {
    console.log("New notification in notifications", data["content"]);
}

function onNotificationPopUp(data) {
    console.log("New notification pop up", data["content"]);
}
//