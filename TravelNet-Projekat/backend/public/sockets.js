const socket = io("http://localhost:5050");

socket.on("message", onMessage);

socket.on("joined", onJoin);

socket.on("notification", onNotifiacation);

window.sendMessage = function sendMessage(data) {
    console.log("Sending message..");
    socket.emit("message", data);
}

window.join = function join(data) {
    console.log("joining...");
    socket.emit("join", data);
}

function onJoin(data) {
    console.log("Joined", data);
}

function onMessage(data) {
    console.log("Message", data);
}

function onNotifiacation(data) {
    console.log("Notifiaction", data);
}