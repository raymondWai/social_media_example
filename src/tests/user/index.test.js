const assert = require('assert');
const chai = require('chai');
const expect = chai.expect;
const bcrypt = require('bcryptjs');
const request = require('supertest');
const app = require('../../..');
const User = require('../../models/user');

describe('user registration', () => {
  it('successful', async function () {
    return new Promise(function (resolve, reject) {
      //register with all param, should success
      request(app)
        .post('/api/users')
        .send({
          username: 'testUser1',
          password: 'zTSB|2Sm&5lgF*',
          firstName: 'Robert',
          lastName: 'Smith',
          email: 'robertsmith@email.com',
          bio: 'I am Robert Smith',
          iconURL: '',
        })
        .expect(200)
        .then(function (res) {
          expect(res.headers).to.have.property('set-cookie');
          assert(res.body.hasOwnProperty('_id'), true);
          resolve();
        })
        .catch((e) => reject(e));
    });
  });
  it('check if password hashed', async function () {
      //ensure the password stored in db is hashed
    const registeredUser = await User.findOne({
      username: 'testUser1',
    }).lean();
    expect(registeredUser).not.to.equal(null);
    expect(
      bcrypt.compareSync('zTSB|2Sm&5lgF*', registeredUser.password)
    ).to.equal(true);
  });
  it('duplicate user', async function () {
    //register again with the same param of first test, should return 400
    return new Promise(function (resolve, reject) {
      request(app)
        .post('/api/users')
        .send({
          username: 'testUser1',
          password: 'zTSB|2Sm&5lgF*',
          firstName: 'Robert',
          lastName: 'Smith',
          email: 'robertsmith@email.com',
          bio: 'I am Robert Smith',
          iconURL: '',
        })
        .expect(400)
        .then((res) => {
          assert(res.body.hasOwnProperty('message'), true);
          assert(res.body.message, 'duplicate_user');
          resolve();
        })
        .catch((e) => reject(e));
    });
  });
  it('missing param', async function () {
    //register with required param missing, should return 400
    return new Promise(function (resolve, reject) {
      request(app)
        .post('/api/users')
        .send({
          password: 'zTSB|2Sm&5lgF*',
          firstName: 'Robert',
          lastName: 'Smith',
          email: 'robertsmith@email.com',
          bio: 'I am Robert Smith',
          iconURL: '',
        })
        .expect(400)
        .then((res) => {
          assert(res.body.hasOwnProperty('message'), true);
          assert(res.body.message, 'missing_param');
          resolve();
        })
        .catch((e) => reject(e));
    });
  });
  it('minimun param', async function () {
    //register with only required param, should ok
    return new Promise(function (resolve, reject) {
      request(app)
        .post('/api/users')
        .send({
          username: 'testUser2',
          password: 'zTSB|2Sm&5lgF*',
          firstName: 'Robert',
          email: 'robertsmith@email.com',
        })
        .expect(200)
        .then((res) => {
          assert(res.body.hasOwnProperty('_id'), true);
          resolve();
        })
        .catch((e) => reject(e));
    });
  });
});

describe('user login', () => {
  it('successful', async function () {
    //login with param of first register test case, should ok
    return new Promise((resolve, reject) => {
      request(app)
        .post('/api/users/login')
        .send({
          username: 'testUser1',
          password: 'zTSB|2Sm&5lgF*',
        })
        .expect(200)
        .then(function (res) {
          expect(res.headers).to.have.property('set-cookie');
          expect(res.body).to.have.all.keys(
            '_id',
            'username',
            'firstName',
            'lastName',
            'email',
            'bio',
            'iconURL',
            'friends',
            'friendRequests',
            'tweets'
          );
          resolve();
        })
        .catch((e) => reject(e));
    });
  });

  it('auth failed', async function () {
    //login with wrong password, should return 400
    return new Promise((resolve, reject) => {
      request(app)
        .post('/api/users/login')
        .send({
          username: 'testUser1',
          password: 'zTSB|2Sm&5lgF*asd',
        })
        .expect(400)
        .then((res) => {
          assert(res.body.hasOwnProperty('message'), true);
          assert(res.body.message, 'auth_failed');
          resolve();
        })
        .catch((e) => reject(e));
    });
  });

  it('no user', async function () {
    //login with nonexisting user, should return 400
    return new Promise((resolve, reject) => {
      request(app)
        .post('/api/users/login')
        .send({
          username: 'testUser4',
          password: 'zTSB|2Sm&5lgF*asd',
        })
        .expect(400)
        .then((res) => {
          assert(res.body.hasOwnProperty('message'), true);
          assert(res.body.message, 'auth_failed');
          resolve();
        })
        .catch((e) => reject(e));
    });
  });

  it('missing param', async function () {
    //login with missing param, should return 400
    return new Promise((resolve, reject) => {
      request(app)
        .post('/api/users/login')
        .send({
          username: 'testUser1',
        })
        .expect(400)
        .then((res) => {
          assert(res.body.hasOwnProperty('message'), true);
          assert(res.body.message, 'missing_param');
          resolve();
        })
        .catch((e) => reject(e));
    });
  });
});
