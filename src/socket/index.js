const { Server } = require('socket.io');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const log4js = require('log4js');
const logger = log4js.getLogger('/socket');
const MongoMessageStore = require('./messageStore');
const errors = require('../constants/errors');
const { User } = require('../models');

const messageStore = new MongoMessageStore();
class SocketServer {
  constructor(server) {
    this.io = new Server(server, {
      path: '/socket.io/chatroom/',
    });
    this.publicKey = fs.readFileSync(
      path.join(process.env.PWD, process.env.JWT_PUB_SECRET_PATH)
    );
    this.onConnection = this.onConnection.bind(this);
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const decoded = jwt.verify(
          token,
          this.publicKey.toString().replace(/\\n/gm, '\n'),
          {
            algorithms: process.env.JWT_ALGORITHM,
            issuer: process.env.JWT_ISSUER,
          }
        );
        const username = socket.handshake.auth.username;
        if (!username || decoded.username != username) {
          next(new Error(errors['authFailed']));
          return;
        }
        socket.userID = decoded._id;
        socket.username = decoded.username;
        next();
      } catch (e) {
        logger.error('socket error', e);
        if (e instanceof JsonWebTokenError) {
          next(new Error(errors['authFailed']));
        } else {
          next(new Error(errors['serverError']));
        }
      }
    });

    this.io.on('connection', this.onConnection);
  }

  async onConnection(socket) {
    try {
      // emit session details
      socket.emit('session', {
        userID: socket.userID,
      });

      // join the "userID" room
      socket.join(socket.userID);

      const messages = await messageStore.findMessagesForUser(socket.userID);
      const messagesPerUser = new Map();
      messages.forEach((message) => {
        const { from, to } = message;
        const otherUser = socket.userID === from ? to : from;
        if (messagesPerUser.has(otherUser)) {
          messagesPerUser.get(otherUser).push(message);
        } else {
          messagesPerUser.set(otherUser, [message]);
        }
      });

      socket.on('message', (data) => this.onMessage(socket, data));
      socket.on('disconnect', () => this.onDisconnect(socket));
    } catch (e) {
      logger.error('saveSession err', e);
    }
  }

  async onMessage(socket, data) {
    try {
      // save and forward the message to the recipent
      const { content, to } = data;
      const message = {
        content,
        from: socket.userID,
        to,
      };
      //user could only send msg to their fd
      const self = await User.findById(socket.userID);
      if (
        self &&
        self.friends &&
        self.friends.find((fd) => fd.toString() == to.toString())
      ) {
        socket.to(to).to(socket.userID).emit('message', message);
        messageStore.saveMessage(message);
      } else {
        //warn the user from sending msg to stranger
        socket.to(socket.userID).emit('message', {
          error: errors['cannotChatWithStranger'],
        });
      }
    } catch (e) {
      logger.error('onMessage err', e);
    }
  }

  async onDisconnect(socket) {
    // notify users upon disconnection
    const matchingSockets = await this.io.in(socket.userID).allSockets();
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected) {
      // notify other users
      socket.broadcast.emit('disconnected', socket.userID);
      // update the connection status of the session
    }
  }
}
module.exports = SocketServer;
