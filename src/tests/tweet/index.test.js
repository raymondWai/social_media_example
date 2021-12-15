const request = require('supertest');
const signupWithLogin = require('../../utils/testSignupAndLogin');
const app = require('../../..');
const { expect } = require('chai');
const errors = require('../../constants/errors');

const users = [
  {
    username: 'postTestUser1',
    password: 'zTSB|2Sm&5lgF*',
    firstName: 'Alex',
    lastName: 'Smith',
    email: 'alexsmith@email.com',
    bio: 'I am Alex Smith',
    iconURL: '',
  },
  {
    username: 'postTestUser2',
    password: 'zTSB|2Sm&5lgF*',
    firstName: 'Robert',
    lastName: 'Peter',
    email: 'robertpeter@email.com',
    bio: 'I am Robert Peter',
    iconURL: '',
  },
];
describe('post', () => {
  let cookies;
  let userObjs;
  before(async () => {
    const loginRess = await Promise.all(
      users.map((user) => signupWithLogin(user, true))
    );
    cookies = loginRess.map((loginRes) => loginRes.cookie);
    userObjs = loginRess.map((loginRes) => loginRes.body);
  });
  it('simply post', async () => {
    //open a post
    return await request(app)
      .post('/api/tweets')
      .set('Authorization', `Bearer ${cookies[1]}`)
      .send({
        content: 'post 1',
      })
      .expect(200)
      .then((res) => {
        expect(res.body).to.have.property('content');
        expect(res.body.content).to.eq('post 1');
      });
  });
  it('simply quote post', async () => {
    //quote a post
    const posts = await request(app)
      .get(`/api/tweets?id=${userObjs[1]._id}`)
      .set('Authorization', `Bearer ${cookies[0]}`);
    return await request(app)
      .post('/api/tweets')
      .set('Authorization', `Bearer ${cookies[0]}`)
      .send({
        content: 'post 1',
        quoted: posts.body[0]._id,
      })
      .expect(200);
  });
  it('simply retweet post', async () => {
    //retweet a post
    const posts = await request(app)
      .get(`/api/tweets?id=${userObjs[1]._id}`)
      .set('Authorization', `Bearer ${cookies[1]}`);
    return await request(app)
      .post('/api/tweets')
      .set('Authorization', `Bearer ${cookies[0]}`)
      .send({
        retweeted: posts.body[0]._id,
      })
      .expect(200);
  });
  it('comment success', async () => {
    //comment a post
    const posts = await request(app)
      .get(`/api/tweets?id=${userObjs[1]._id}`)
      .set('Authorization', `Bearer ${cookies[1]}`);
    return await request(app)
      .post('/api/tweets')
      .set('Authorization', `Bearer ${cookies[0]}`)
      .send({
        commentTo: posts.body[0]._id,
        content: 'nice post',
      })
      .expect(200)
      .then((res) => {
        expect(res.body).to.have.property('content');
        expect(res.body.content).to.eq('nice post');
      });
  });
  it('get a post', async () => {
    //get a post
    const posts = await request(app)
      .get(`/api/tweets?id=${userObjs[1]._id}`)
      .set('Authorization', `Bearer ${cookies[0]}`);
    return await request(app)
      .get(`/api/tweets/${posts.body[0]._id}`)
      .set('Authorization', `Bearer ${cookies[0]}`)
      .expect(200);
  });
  it('edit post success', async () => {
    //edit a post
    const posts = await request(app)
      .get(`/api/tweets?id=${userObjs[1]._id}`)
      .set('Authorization', `Bearer ${cookies[1]}`);
    return await request(app)
      .put(`/api/tweets/${posts.body[0]._id}`)
      .set('Authorization', `Bearer ${cookies[1]}`)
      .send({
        content: 'post 2',
      })
      .expect(200)
      .then((res) => {
        expect(res.body.content).to.eq('post 2');
      });
  });
  it('like post success', async () => {
    //like a post
    const posts = await request(app)
      .get(`/api/tweets?id=${userObjs[1]._id}`)
      .set('Authorization', `Bearer ${cookies[1]}`);
    return await request(app)
      .put(`/api/tweets/${posts.body[0]._id}/like`)
      .set('Authorization', `Bearer ${cookies[0]}`)
      .expect(200)
      .then((res) => {
        expect(
          res.body.likedBy.filter((u) => u.username == userObjs[0].username).length
        ).to.eq(1);
      });
  });
  it('unlike post success', async () => {
    //unlike a post
    const posts = await request(app)
      .get(`/api/tweets?id=${userObjs[1]._id}`)
      .set('Authorization', `Bearer ${cookies[1]}`);
    return await request(app)
      .put(`/api/tweets/${posts.body[0]._id}/like`)
      .set('Authorization', `Bearer ${cookies[0]}`)
      .expect(200)
      .then((res) => {
        expect(
          res.body.likedBy.filter((u) => u.username == userObjs[0].username).length
        ).to.eq(0);
      });
  });

  it('like unexisting post', async () => {
    const posts = await request(app)
      .get(`/api/tweets?id=${userObjs[1]._id}`)
      .set('Authorization', `Bearer ${cookies[1]}`);
    return await request(app)
      .put(`/api/tweets/61b91f994f503b9d09645618/like`)
      .set('Authorization', `Bearer ${cookies[0]}`)
      .expect(400)
      .then((res) => {
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.eq(errors['noSuchPost']);
      });
  });

  it('edit post unauth', async () => {
    const posts = await request(app)
      .get(`/api/tweets?id=${userObjs[1]._id}`)
      .set('Authorization', `Bearer ${cookies[1]}`);
    return await request(app)
      .put(`/api/tweets/${posts.body[0]._id}`)
      .set('Authorization', `Bearer ${cookies[0]}`)
      .send({
        content: 'post 2',
      })
      .expect(400)
      .then((res) => {
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.eq(errors['unauthorized']);
      });
  });
  it('edit unexisting post', async () => {
    return await request(app)
      .put(`/api/tweets/61b91f994f503b9d09645618`)
      .set('Authorization', `Bearer ${cookies[1]}`)
      .send({
        content: 'post 2',
      })
      .expect(400)
      .then((res) => {
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.eq(errors['noSuchPost']);
      });
  });
  it('edit post no comment', async () => {
    const posts = await request(app)
      .get(`/api/tweets?id=${userObjs[1]._id}`)
      .set('Authorization', `Bearer ${cookies[1]}`);
    return await request(app)
      .put(`/api/tweets/${posts.body[0]._id}`)
      .set('Authorization', `Bearer ${cookies[1]}`)
      .send({})
      .expect(400)
      .then((res) => {
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.eq(errors['missingParam']);
      });
  });
  it('retweet unexisting post', async () => {
    return await request(app)
      .post('/api/tweets')
      .set('Authorization', `Bearer ${cookies[0]}`)
      .send({
        retweeted: '61b91f994f503b9d09645618',
      })
      .expect(400)
      .then((res) => {
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.eq(errors['noSuchPost']);
      });
  });
  it('quote unexisting post', async () => {
    return await request(app)
      .post('/api/tweets')
      .set('Authorization', `Bearer ${cookies[0]}`)
      .send({
        quoted: '61b91f994f503b9d09645618',
      })
      .expect(400)
      .then((res) => {
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.eq(errors['noSuchPost']);
      });
  });
  it('post no content', async () => {
    return await request(app)
      .post('/api/tweets')
      .set('Authorization', `Bearer ${cookies[0]}`)
      .send({})
      .expect(400)
      .then((res) => {
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.eq(errors['missingParam']);
      });
  });
  it('comment missing comment', async () => {
    const posts = await request(app)
      .get(`/api/tweets?id=${userObjs[1]._id}`)
      .set('Authorization', `Bearer ${cookies[1]}`);
    return await request(app)
      .post('/api/tweets')
      .set('Authorization', `Bearer ${cookies[0]}`)
      .send({
        commentTo: posts.body[0]._id,
      })
      .expect(400)
      .then((res) => {
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.eq(errors['missingParam']);
      });
  });
  it('comment to unexisting post', async () => {
    const posts = await request(app)
      .get(`/api/tweets?id=${userObjs[1]._id}`)
      .set('Authorization', `Bearer ${cookies[1]}`);
    return await request(app)
      .post('/api/tweets')
      .set('Authorization', `Bearer ${cookies[0]}`)
      .send({
        commentTo: '61b91f994f503b9d09645618',
        content: 'gd post',
      })
      .expect(400)
      .then((res) => {
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.eq(errors['noSuchPost']);
      });
  });
  it('delete post unauth', async () => {
    const posts = await request(app)
      .get(`/api/tweets?id=${userObjs[1]._id}`)
      .set('Authorization', `Bearer ${cookies[1]}`);
    return await request(app)
      .delete(`/api/tweets/${posts.body[0]._id}`)
      .set('Authorization', `Bearer ${cookies[0]}`)
      .expect(400)
      .then((res) => {
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.eq(errors['unauthorized']);
      });
  });
  it('delete post success', async () => {
    const posts = await request(app)
      .get(`/api/tweets?id=${userObjs[1]._id}`)
      .set('Authorization', `Bearer ${cookies[1]}`);
    return await request(app)
      .delete(`/api/tweets/${posts.body[0]._id}`)
      .set('Authorization', `Bearer ${cookies[1]}`)
      .expect(200);
  });
  it('delete unexisting post', async () => {
    const posts = await request(app)
      .get(`/api/tweets?id=${userObjs[1]._id}`)
      .set('Authorization', `Bearer ${cookies[1]}`);
    return await request(app)
      .delete(`/api/tweets/61b91f994f503b9d09645618`)
      .set('Authorization', `Bearer ${cookies[1]}`)
      .expect(400)
      .then((res) => {
        expect(res.body).to.have.property('message');
        expect(res.body.message).to.eq(errors['noSuchPost']);
      });
  });
});
