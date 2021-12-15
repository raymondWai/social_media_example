const { User } = require('../models');
const log4js = require('log4js');
const errors = require('../constants/errors');
const { authFailed } = require('../constants/errors');
const logger = log4js.getLogger('/friends');

class FriendsController {
  static async addFriend(req, res, next) {
    try {
      const { requestedFor } = req.body;
      const friendYouWant = await User.findOne({ username: requestedFor });
      if (friendYouWant) {
        friendYouWant.friendRequests.push(`${req.user._id}`);
        await friendYouWant.save();
        res.status(200).json({
          status: 'success',
        });
      } else {
        next(new Error(errors['noSuchUser']));
      }
    } catch (e) {
      logger.error('add Friend', e);
      next(new Error(errors['serverError']));
    }
  }
  static async accept(req, res, next) {
    try {
      const { requestedBy } = req.body;
      const self = await User.findById(req.user._id).populate('friendRequests');
      if (self) {
        const corrFdReq = self.friendRequests.filter(
          (fdReq) => fdReq.username == requestedBy
        );
        if (corrFdReq.length > 0) {
          //if the request valid, add each other to be frind
          self.friendRequests = self.friendRequests.filter(
            (fdReq) => fdReq.username != requestedBy
          );
          self.friends.push(corrFdReq[0]._id);
          await self.save();
          const newFriend = await User.findById(corrFdReq[0]._id);
          newFriend.friends.push(self._id);
          await newFriend.save();
          res.status(200).json({
            status: 'success',
          });
        } else {
          next(new Error(errors['noSuchReqOrAccepted']));
        }
      } else {
        next(new Error(errors['authFailed']));
      }
    } catch (e) {
      logger.error('accept Friend', e);
      next(new Error(errors['serverError']));
    }
  }
}
module.exports = FriendsController;
