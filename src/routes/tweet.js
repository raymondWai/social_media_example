const express = require('express');
const jwt = require('express-jwt');
const path = require('path');
const fs = require('fs');
const TweetController = require('../controllers/TweetController');
const router = express.Router();
const publicKey = fs.readFileSync(
  path.join(process.env.PWD, process.env.JWT_PUB_SECRET_PATH)
);
router.use(
  jwt({
    secret: publicKey,
    algorithms: ['RS256'],
    issuer: process.env.JWT_ISSUER,
  })
);
router.post('/', TweetController.post);
router.get('/', TweetController.getPostByUserId);
router.get('/:id', TweetController.getPost);
router.put('/:id', TweetController.editPost);
router.delete('/:id', TweetController.deletePost);
router.put('/:id/like', TweetController.likePost);
module.exports = router;
