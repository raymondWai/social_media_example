require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const SocketServer = require('./src/socket');
const log4js = require('log4js');
const logger = log4js.getLogger('/');
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const socketServer = new SocketServer(server);
server.listen(PORT, () => {
  logger.debug(`app is listening on port: ${PORT}`);
});
module.exports = server;
