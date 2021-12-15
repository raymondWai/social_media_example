const log4js = require('log4js');
const mongoose = require('mongoose');
const User = require('./user');
const Tweet = require('./tweet');
const Message = require('./message');
const logger = log4js.getLogger('/model');
const dbConnect = async function () {
  await mongoose.connect(
    `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${
      process.env.NODE_ENV === 'testing'
        ? process.env.TESTING_DB_NAME
        : process.env.DB_NAME
    }`
  );
  logger.debug('db connected');
};
dbConnect().catch((e) => logger.error('db connect error: ', e));
module.exports = { User, Tweet, Message };
