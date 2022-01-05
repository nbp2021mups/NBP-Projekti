const http = require('http');
const app = require('./backend/app');

const hostname = "localhost";
const port = 3000 || process.env.PORT;

const server = http.createServer(app);

server.listen({
    host: hostname,
    port: port
}, () => {
    console.log(`Server listening on port http://${hostname}:${port}`)
});