const socket = io("http://localhost:5050");

socket.on("message", (data) => {
    console.log(data);
});
console.log("joining...");