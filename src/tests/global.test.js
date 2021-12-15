require('dotenv').config();
const mongoose = require('mongoose');
const { User, Tweet } = require('../models/');

after(async function () {
  await mongoose.connect(
    `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${
      process.env.NODE_ENV === 'testing'
        ? process.env.TESTING_DB_NAME
        : process.env.DB_NAME
    }`
  );
  await User.deleteMany({});
  await Tweet.deleteMany({});
  console.log('db reseted');
});
