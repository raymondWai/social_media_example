require('dotenv').config();
const assert = require('assert');
const chai = require('chai');
const expect = chai.expect;
const http = require('http');
const app = require('../../app');
const User = require('../../models/user');
const request = require('supertest');
const signupWithLogin = require('../../utils/testSignupAndLogin');
const SocketServer = require('../../socket');
const { io } = require('socket.io-client');
const errors = require('../../constants/errors');
const { Message } = require('../../models');

const users = [
  {
    username: 'chatTestUser1',
    password: 'zTSB|2Sm&5lgF*',
    firstName: 'Alex',
    lastName: 'Smith',
    email: 'alexsmith@email.com',
    bio: 'I am Alex Smith',
    iconURL: '',
  },
  {
    username: 'chatTestUser2',
    password: 'zTSB|2Sm&5lgF*',
    firstName: 'Robert',
    lastName: 'Peter',
    email: 'robertpeter@email.com',
    bio: 'I am Robert Peter',
    iconURL: '',
  },
  {
    username: 'chatTestUser3',
    password: 'zTSB|2Sm&5lgF*',
    firstName: 'Robert',
    lastName: 'Peter',
    email: 'robertpeter@email.com',
    bio: 'I am Robert Peter',
    iconURL: '',
  },
];
const server = http.createServer(app);
const socketServer = new SocketServer(server);
describe('chatroom', () => {
  let cookies;
  let userObjs;
  before(async () => {
    //prepare all ac and cookies for test
    const loginRess = await Promise.all(
      users.map((user) => signupWithLogin(user, true))
    );
    cookies = loginRess.map((loginRes) => loginRes.cookie);
    userObjs = loginRess.map((loginRes) => loginRes.body);
    await request(server)
      .post('/api/friends')
      .set('Authorization', `Bearer ${cookies[0]}`)
      .send({
        requestedFor: users[1].username,
      });
    await request(server)
      .put('/api/friends/accept')
      .set('Authorization', `Bearer ${cookies[1]}`)
      .send({
        requestedBy: users[0].username,
      });
  });

  after(() => {
    //clear created user and message
    User.deleteMany({
      username: {
        $in: users.map((user) => user.username),
      },
    });
    Message.deleteMany({});
  });

  it('connect success', async () => {
    //connect with first user, should success
    return new Promise((resolve, reject) => {
      const clientSocket = io('ws://localhost:3000/', {
        transports: ['websocket'],
        path: '/socket.io/chatroom/',
        reconnection: false,
        reconnectionAttempts: 0,
        auth: (cb) => {
          cb({ token: cookies[0][0], username: users[0].username });
        },
      });
      clientSocket.on('connect', (socket) => {
        clientSocket.emit('ping');
        resolve();
      });
      clientSocket.on('session', (data) => {
        expect(data).to.have.all.keys(['userID']);
        clientSocket.disconnect();
        resolve();
      });
    });
  });

  it('send message success', async () => {
    //send message with second user, should success
    return new Promise((resolve, reject) => {
      const client2Socket = io('ws://localhost:3000/', {
        transports: ['websocket'],
        path: '/socket.io/chatroom/',
        reconnection: false,
        reconnectionAttempts: 0,
        auth: (cb) => {
          cb({ token: cookies[1][0], username: users[1].username });
        },
      });
      const client1Socket = io('ws://localhost:3000/', {
        transports: ['websocket'],
        path: '/socket.io/chatroom/',
        reconnection: false,
        reconnectionAttempts: 0,
        auth: (cb) => {
          cb({ token: cookies[0][0], username: users[0].username });
        },
      });

      client2Socket.on('message', async (data) => {
        expect(data.content).to.eq('hi');
        //check if onw and only message created
        const messages = await Message.find({
          from: userObjs[0]._id,
          to: userObjs[1]._id,
          content: 'hi',
        });
        expect(messages.length).to.eq(1);
        client1Socket.disconnect();
        client2Socket.disconnect();
        resolve();
      });

      client1Socket.on('session', (data) => {
        //send message when the first event listened
        client1Socket.emit('message', {
          content: 'hi',
          to: userObjs[1]._id,
        });
      });
    });
  });
  it('cannot chat with stranger', async () => {
    //send message to strange, will receive error
    return new Promise((resolve, reject) => {
      const client1Socket = io('ws://localhost:3000/', {
        transports: ['websocket'],
        path: '/socket.io/chatroom/',
        reconnection: false,
        reconnectionAttempts: 0,
        auth: (cb) => {
          cb({ token: cookies[0][0], username: users[0].username });
        },
      });
      client1Socket.on('session', (data) => {
        //send message when the first event listened
        client1Socket.emit('message', {
          content: 'hi',
          to: userObjs[2]._id,
        });
      });
      client1Socket.on('message', (data) => {
        //system will warn the user through message
        expect(data).to.have.property('error');
        expect(data.error).to.eq(errors['cannotChatWithStranger']);
        client1Socket.disconnect();
        resolve();
      });
    });
  });

  it('aurh failed wrong token', async () => {
    return new Promise((resolve, reject) => {
      //connect with invalid token, will not be connected
      const clientSocket = io('ws://localhost:3000/', {
        transports: ['websocket'],
        path: '/socket.io/chatroom/',
        reconnection: false,
        reconnectionAttempts: 0,
        auth: (cb) => {
          cb({ token: 'asdas', username: users[0].username });
        },
      });
      clientSocket.on('disconnect', (reason) => {
        expect(reason).not.to.eq(null);
        resolve();
      });
    });
  });
  it('aurh failed mismatch username', async () => {
    //connect with valid token but wrong username, will not be connected
    return new Promise((resolve, reject) => {
      const clientSocket = io('ws://localhost:3000/', {
        transports: ['websocket'],
        path: '/socket.io/chatroom/',
        reconnection: false,
        reconnectionAttempts: 0,
        auth: (cb) => {
          cb({ token: cookies[0][0], username: users[1].username });
        },
      });
      clientSocket.on('disconnect', (reason) => {
        expect(reason).not.to.eq(null);
        resolve();
      });
      clientSocket.on('connect_error', (reason) => {
        expect(reason).to.have.property('message');
        expect(reason.message).to.eq(errors['authFailed']);
        clientSocket.disconnect();
        resolve();
      });
    });
  });
});
