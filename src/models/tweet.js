const { Schema, model } = require('mongoose');

const tweetSchema = new Schema({
  createdBy: { type: Schema.Types.ObjectId, ref: 'user' },
  content: { type: String },
  likedBy: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  retweetedBy: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  retweeted: {
    type: Schema.Types.ObjectId,
    ref: 'tweet',
  },
  quotedBy: [
    {
      type: Schema.Types.ObjectId,
      ref: 'tweet',
    },
  ],
  quoted: {
    type: Schema.Types.ObjectId,
    ref: 'tweet',
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'tweet',
    },
  ],
});
module.exports = model('tweet', tweetSchema);
