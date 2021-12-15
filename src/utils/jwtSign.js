const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

/**
 *
 * @param {String} _id
 * @param {String} username
 * @returns {String} token
 */
function jwtSign(_id, username) {
  //sign _id and suername with rsa algorithm
  const privateKey = fs.readFileSync(
    path.join(process.env.PWD, process.env.JWT_PRI_SECRET_PATH)
  );
  return jwt.sign(
    {
      _id,
      username,
    },
    privateKey.toString().replace(/\\n/gm, '\n'),
    {
      algorithm: process.env.JWT_ALGORITHM,
      expiresIn: '1d',
      issuer: process.env.JWT_ISSUER,
    }
  );
}
module.exports = jwtSign;
