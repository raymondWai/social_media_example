const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String },
  password: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
  bio: { type: String },
  iconURL: { type: String },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  friendRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  tweets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'tweet',
    },
  ],
});
userSchema.statics = {
  checkDuplicate: async function (username) {
    const existingUser = await this.findOne({
      username,
    }).exec();
    return Boolean(existingUser);
  },
  getUserByUsername: async function (username) {
    return this.findOne({
      username,
    }).lean();
  },
};
module.exports = mongoose.model('user', userSchema);
