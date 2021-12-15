const { Schema, model } = require('mongoose');

const messageSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  content: { type: String },
  sentOn: { type: Date },
});
module.exports = model('message', messageSchema);
