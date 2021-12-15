const log4js = require('log4js');
const bcrypt = require('bcryptjs');
const errors = require('../constants/errors');
const { User } = require('../models');
const jwtSign = require('../utils/jwtSign');
const logger = log4js.getLogger('/users');

class UserController {
  static async signup(req, res, next) {
    try {
      const { username, password, firstName, lastName, email, bio, iconURL } =
        req.body;
      //Check if all required param present
      if (username && password && firstName && email) {
        //Check if user with same username exist
        const isDuplicated = await User.checkDuplicate(username);
        if (isDuplicated) {
          next(new Error(errors['duplicateUser']));
        } else {
          //hash the password using bcrypt
          const hashedPassword = bcrypt.hashSync(password, 10);
          const user = new User({
            username,
            password: hashedPassword,
            firstName,
            lastName,
            email,
            bio,
            iconURL,
            friends: [],
            friendRequests: [],
            tweets: [],
          });
          const { _id } = await user.save();
          res.set('Set-Cookie', jwtSign(_id, username));
          //return the _id
          res.status(200).json({
            _id,
          });
        }
      } else {
        next(new Error(errors['missingParam']));
      }
    } catch (e) {
      //unknown error occur
      logger.error('registrater err', e);
      next(new Error(errors['serverError']));
    }
  }

  static async login(req, res, next) {
    try {
      const { username, password } = req.body;
      if (username && password) {
        const user = await User.getUserByUsername(username);
        if (user) {
          if (bcrypt.compareSync(password, user['password'])) {
            res.set('Set-Cookie', jwtSign(user._id, user.username));
            res.status(200).json({
              ...user,
              __v: undefined,
              password: undefined,
            });
          } else {
            next(new Error(errors['authFailed']));
          }
        } else {
          next(new Error(errors['authFailed']));
        }
      } else {
        next(new Error(errors['missingParam']));
      }
    } catch (e) {
      //unknown error occur
      logger.error('login err', e);
      next(new Error(errors['serverError']));
    }
  }
}

module.exports = UserController;
