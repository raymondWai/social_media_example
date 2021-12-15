const { Message } = require('../models');
/* abstract */ class MessageStore {
  saveMessage(message) {}
  findMessagesForUser(userID) {}
}

class MongoMessageStore extends MessageStore {
  constructor() {
    super();
  }
  async saveMessage(message) {
    //write message to db
    const newMessage = new Message({
      from: message.from,
      to: message.to,
      content: message.content,
    });
    await newMessage.save();
  }
  async findMessagesForUser(userID) {
    //find sent message
    return await Message.find({
      from: userID,
    }).lean();
  }
}

module.exports = MongoMessageStore;
