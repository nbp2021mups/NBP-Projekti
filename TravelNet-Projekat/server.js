const http=require('http');
const app=require('./backend/app');

const port= 3000 || process.env.PORT;
app.set('port',port);

const server=http.createServer(app);
server.listen(port);