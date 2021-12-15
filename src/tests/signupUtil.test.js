const chai = require('chai');
const { User } = require('../models');
const expect = chai.expect;
const signupWithLogin = require('../utils/testSignupAndLogin');

describe('signup with login', () => {
  const user = {
    username: 'signupTestUser1',
    password: 'zTSB|2Sm&5lgF*',
    firstName: 'Robert',
    lastName: 'Peter',
    email: 'robertpeter@email.com',
    bio: 'I am Robert Peter',
    iconURL: '',
  };
  it('success', async () => {
    const result = await signupWithLogin(user);
    expect(result.length).eq(1);
    expect(result[0]).is.string;
  });
  after(() => {
    User.deleteMany({
      username: user.username,
    });
  });
});
