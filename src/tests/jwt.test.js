const jwt = require('jsonwebtoken');
const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');
const path = require('path');
const jwtSign = require('../utils/jwtSign');

describe('jwt', () => {
  it('verified', () => {
    const token = jwtSign('123456', '234567');
    const publicKey = fs.readFileSync(
      path.join(process.env.PWD, process.env.JWT_PUB_SECRET_PATH)
    );
    const decoded = jwt.verify(
      token,
      publicKey.toString().replace(/\\n/gm, '\n'),
      {
        algorithms: process.env.JWT_ALGORITHM,
        issuer: process.env.JWT_ISSUER,
      }
    );
    expect(decoded).to.not.equal(null);
    expect(decoded._id).to.eq('123456');
    expect(decoded.username).to.eq('234567');
  });
  it('invalid signiture', () => {
    const token = jwt.sign(
      {
        _id: '123456',
        username: '234567',
      },
      'ajsdas',
      {
        algorithm: 'HS512',
        expiresIn: '1d',
        issuer: process.env.JWT_ISSUER,
      }
    );
    const publicKey = fs.readFileSync(
      path.join(process.env.PWD, process.env.JWT_PUB_SECRET_PATH)
    );
    try {
      const decoded = jwt.verify(
        token,
        publicKey.toString().replace(/\\n/gm, '\n'),
        {
          algorithms: process.env.JWT_ALGORITHM,
          issuer: process.env.JWT_ISSUER,
        }
      );
    } catch (e) {
      expect(e).not.to.equal(null);
    }
  });
  it('invalid key', () => {
    const privateKey = fs.readFileSync(
      path.join(process.env.PWD, 'src/config/jwt/testPrivateKey.pem')
    );
    const token = jwt.sign(
      {
        _id: '123456',
        username: '234567',
      },
      privateKey,
      {
        algorithm: process.env.JWT_ALGORITHM,
        expiresIn: '1d',
        issuer: process.env.JWT_ISSUER,
      }
    );
    const publicKey = fs.readFileSync(
      path.join(process.env.PWD, process.env.JWT_PUB_SECRET_PATH)
    );
    try {
      const decoded = jwt.verify(
        token,
        publicKey.toString().replace(/\\n/gm, '\n'),
        {
          algorithms: process.env.JWT_ALGORITHM,
          issuer: process.env.JWT_ISSUER,
        }
      );
    } catch (e) {
      expect(e).not.to.equal(null);
    }
  });
});
