const request = require('supertest');
const app = require('../../');
const signupWithLogin = async (userDetail, getFullObj = false) => {
  await request(app)
    .post('/api/users')
    .send({
      ...userDetail,
    })
    .catch((e) => {
      throw e;
    });
  const loginRes = await request(app).post('/api/users/login').send({
    username: userDetail.username,
    password: userDetail.password,
  });
  if (getFullObj) {
    return {
      cookie: loginRes.headers['set-cookie'],
      body: loginRes.body,
    };
  }
  return loginRes.headers['set-cookie'];
};
module.exports = signupWithLogin;
