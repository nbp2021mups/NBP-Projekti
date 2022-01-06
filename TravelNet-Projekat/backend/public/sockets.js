console.log("Connecting...");
const socket = io("http://localhost:5050");

socket.on("connected", onConnected);
socket.on("error", onError);
socket.on("joined", onJoin);
socket.on("message", onMessage);
socket.on("message-sent", onSentMessage);
socket.on("notification", onNotifiacation);


// Logic
let loggedUser = null;
const user = document.body.querySelector("#username");
const content = document.body.querySelector("#content");
const forUser = document.body.querySelector("#forUser");

window.sendMessage = function sendMessage() {
    if (!loggedUser)
        return alert("Not logged in!");

    if (content.value && forUser.value) {
        console.log("Sending message..");
        socket.emit("message", { from: loggedUser, to: forUser.value, content: content.value, time_sent: new Date() });
    }
}

window.join = function join() {
        if (user.value) {
            console.log("joining...");
            socket.emit("join", { username: user.value });
        }
    }
    //


// Event handlers
function onConnected() {
    console.log("Connected");
}

function onError(data) {
    console.log("Error", data);
}

function onJoin(data) {
    console.log("Joined", data);
    loggedUser = data["username"];
}

function onMessage(data) {
    console.log("Message", data);
}

function onSentMessage(data) {
    console.log("Message sent", data);
}

function onNotifiacation(data) {
    console.log("Notifiaction", data);
}
//