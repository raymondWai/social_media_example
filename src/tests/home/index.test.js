const assert = require('assert');
const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../..');
describe('ping', () => {
  it('get', async () => {
    return request(app).get('/api/').expect(200);
  });
});
