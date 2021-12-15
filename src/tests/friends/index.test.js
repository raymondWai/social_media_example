const assert = require('assert');
const request = require('supertest');
const app = require('../../..');
const errors = require('../../constants/errors');
const User = require('../../models/user');
const signupWithLogin = require('../../utils/testSignupAndLogin');

describe('friends', () => {
  let cookies;
  const users = [
    {
      username: 'fdTestUser1',
      password: 'zTSB|2Sm&5lgF*',
      firstName: 'Alex',
      lastName: 'Smith',
      email: 'alexsmith@email.com',
      bio: 'I am Alex Smith',
      iconURL: '',
    },
    {
      username: 'fdTestUser2',
      password: 'zTSB|2Sm&5lgF*',
      firstName: 'Robert',
      lastName: 'Peter',
      email: 'robertpeter@email.com',
      bio: 'I am Robert Peter',
      iconURL: '',
    },
  ];
  before(async () => {
    //preparing all required ac and cookies
    cookies = await Promise.all(users.map((user) => signupWithLogin(user)));
  });

  after(() => {
    User.deleteMany({
      username: {
        $in: users.map((user) => user.username),
      },
    });
  });

  it('add friend success', async () => {
    return await request(app)
      .post('/api/friends')
      .set('Authorization', `Bearer ${cookies[0]}`)
      .send({
        requestedFor: users[1].username,
      })
      .expect(200);
  });
  it('accept friend success', async () => {
    return await request(app)
      .put('/api/friends/accept')
      .set('Authorization', `Bearer ${cookies[1]}`)
      .send({
        requestedBy: users[0].username,
      })
      .expect(200);
  });

  it('accepted req', async () => {
    //accept fd req that already accepted, should return 400
    return await request(app)
      .put('/api/friends/accept')
      .set('Authorization', `Bearer ${cookies[1]}`)
      .send({
        requestedBy: users[0].username,
      })
      .expect(400)
      .then((res) => {
        assert(res.body.hasOwnProperty('message'), true);
        assert(res.body.message, errors['noSuchReqOrAccepted']);
      });
  });

  it('no such user', async () => {
    //add a nonexisting user as fd, should return 400
    return await request(app)
      .post('/api/friends')
      .set('Authorization', `Bearer ${cookies[0]}`)
      .send({
        requestedFor: 'fdTestUser3',
      })
      .expect(400)
      .then((res) => {
        assert(res.body.hasOwnProperty('message'), true);
        assert(res.body.message, errors['noSuchUser']);
      });
  });
  it('no such req', async () => {
    //accept a nonexisting fd req, should return 400
    return await request(app)
      .put('/api/friends/accept')
      .set('Authorization', `Bearer ${cookies[1]}`)
      .send({
        requestedBy: 'fdTestUser3',
      })
      .expect(400)
      .then((res) => {
        assert(res.body.hasOwnProperty('message'), true);
        assert(res.body.message, errors['noSuchReqOrAccepted']);
      });
  });
});
