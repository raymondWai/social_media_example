const express = require('express');
const UserRouter = require('./user');
const TweetRouter = require('./tweet');
const FriendRouter = require('./friends');

const router = express.Router();
router.get('/', (req, res) => {
  res.status(200).send('OK');
});
router.use('/users', UserRouter);
router.use('/tweets', TweetRouter);
router.use('/friends', FriendRouter);
module.exports = router;
