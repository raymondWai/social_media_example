const errors = require('../constants/errors');
const log4js = require('log4js');
const logger = log4js.getLogger('/tweet');
const { Tweet } = require('../models');
class TweetController {
  static async getPostByUserId(req, res, next) {
    try {
      // get all post of a user
      const { id } = req.query;
      if (id) {
        const post = await Tweet.find({
          createdBy: id,
        })
          .populate('likedBy', 'username')
          .populate('retweetedBy')
          .populate('retweeted')
          .populate('quotedBy')
          .populate('quoted')
          .populate('comments')
          .lean();
        res.status(200).json({
          ...post,
        });
      } else {
        next(new Error(errors['missingParam']));
      }
    } catch (e) {
      logger.error('getPostByUserId err', e);
      next(new Error(errors['serverError']));
    }
  }
  static async getPost(req, res, next) {
    try {
      // get all detail of a post
      const { id } = req.params;
      const post = await Tweet.findById(id)
        .populate('likedBy', 'username')
        .populate('retweetedBy')
        .populate('retweeted')
        .populate('quotedBy')
        .populate('quoted')
        .populate('comments')
        .lean();
      if (post) {
        res.status(200).json({
          ...post,
        });
      } else {
        next(new Error(errors['noSuchPost']));
      }
    } catch (e) {
      next(new Error(errors['serverError']));
    }
  }
  static async post(req, res, next) {
    try {
      // content, quoted, retweeted, commentT are tweated as different way to post
      const { content, quoted, retweeted, commentTo } = req.body;
      if (commentTo) {
        if (!content) {
          next(new Error(errors['missingParam']));
          return;
        }
        //quoting post, will ignore retweeted
        const parentPost = await Tweet.findById(commentTo);
        if (parentPost) {
          const newPost = new Tweet({
            createdBy: req.user._id,
            content,
            likedBy: [],
            retweetedBy: [],
            quotedBy: [],
            comments: [],
          });
          const newPostRes = await newPost.save();
          parentPost.comments.push(newPostRes._id);
          await parentPost.save();
          res.status(200).json({
            _id: newPostRes._id,
            content: newPostRes.content,
          });
        } else {
          next(new Error(errors['noSuchPost']));
        }
      } else if (quoted) {
        //quoting post, will ignore retweeted
        const parentPost = await Tweet.findById(quoted);
        if (parentPost) {
          const newPost = new Tweet({
            createdBy: req.user._id,
            content,
            likedBy: [],
            retweetedBy: [],
            quotedBy: [],
            quoted: parentPost._id,
            comments: [],
          });
          const newPostRes = await newPost.save();
          parentPost.quotedBy.push(newPostRes._id);
          await parentPost.save();
          res.status(200).json({
            _id: newPostRes._id,
            content: newPostRes.content,
          });
        } else {
          next(new Error(errors['noSuchPost']));
        }
      } else if (retweeted) {
        //retweeting post, will ignore content
        const parentPost = await Tweet.findById(retweeted);
        if (parentPost) {
          const newPost = new Tweet({
            createdBy: req.user._id,
            content: '',
            likedBy: [],
            retweetedBy: [],
            retweeted: parentPost._id,
            quotedBy: [],
            comments: [],
          });
          const newPostRes = await newPost.save();
          parentPost.quotedBy.push(newPostRes._id);
          await parentPost.save();
          res.status(200).json({
            _id: newPostRes._id,
            content: newPostRes.content,
          });
        } else {
          next(new Error(errors['noSuchPost']));
        }
      } else if (content) {
        //only content is posted
        const newPost = new Tweet({
          createdBy: req.user._id,
          content,
          likedBy: [],
          retweetedBy: [],
          quotedBy: [],
          comments: [],
        });
        const newPostRes = await newPost.save();
        res.status(200).json({
          _id: newPostRes._id,
          content: newPostRes.content,
        });
      } else {
        //no content
        next(new Error(errors['missingParam']));
      }
    } catch (e) {
      logger.error('post err', e);
      next(new Error(errors['serverError']));
    }
  }
  static async editPost(req, res, next) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      if (id && content) {
        const postToEdit = await Tweet.findById(id);
        if (postToEdit) {
            //if the creater of the product is not the user, return 404
          if (postToEdit.createdBy.toString() == req.user._id.toString()) {
            postToEdit.content = content;
            const editRes = await postToEdit.save();
            res.status(200).json(editRes);
          } else {
            next(new Error(errors['unauthorized']));
          }
        } else {
          next(new Error(errors['noSuchPost']));
        }
      } else {
        next(new Error(errors['missingParam']));
      }
    } catch (e) {
      logger.error('editPost err', e);
      next(new Error(errors['serverError']));
    }
  }
  static async deletePost(req, res, next) {
    try {
      const { id } = req.params;
      const postToDel = await Tweet.findById(id);
      if (postToDel) {
        if (postToDel.createdBy.toString() == req.user._id.toString()) {
            //if the creater of the product is not the user, return 404
          await Tweet.deleteOne({ _id: id });
          res.status(200).json({ status: 'success' });
        } else {
          next(new Error(errors['unauthorized']));
        }
      } else {
        next(new Error(errors['noSuchPost']));
      }
    } catch (e) {
      logger.error('editPost err', e);
      next(new Error(errors['serverError']));
    }
  }
  static async likePost(req, res, next) {
    try {
      const { id } = req.params;
      if (id) {
        const postToLike = await Tweet.findById(id);
        if (postToLike) {
            //the user already liked, remove it
          if (
            postToLike.likedBy.find(
              (u) => u._id.toString() == req.user._id.toString()
            )
          ) {
            postToLike.likedBy = postToLike.likedBy.filter(
              (u) => u._id.toString() != req.user._id.toString()
            );
          } else {
            postToLike.likedBy.push(req.user._id);
          }
          await postToLike.save();
          const newPost = await Tweet.findById(id)
            .populate('likedBy', 'username')
            .populate('retweetedBy')
            .populate('retweeted')
            .populate('quotedBy')
            .populate('quoted')
            .populate('comments')
            .lean();
          res.status(200).json({
            ...newPost,
          });
        } else {
          next(new Error(errors['noSuchPost']));
        }
      } else {
        next(new Error(errors['missingParam']));
      }
    } catch (e) {
      logger.error('likePost err', e);
      next(new Error(errors['serverError']));
    }
  }
}
module.exports = TweetController;
