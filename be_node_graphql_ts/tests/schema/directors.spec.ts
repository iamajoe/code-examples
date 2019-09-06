import { assert } from 'chai';
import * as supertest from 'supertest';
import { init, close, IApp } from '../../src';

// --------------------------------------------------
// variables

let app: IApp;
let request;

// --------------------------------------------------
// test suite

describe('\'directors\' schema', () => {
  before(async () => {
    app = await init({ hideLogs: true });
    request = supertest(`http://localhost:${app.port}`);
  });
  after(async () => {
    await close(app);
    (<any>app) = null;
    (<any>request) = null;
  });

  describe('director', () => {
    it('returns director', async () => {
      const res = await request.post('/graphql')
      .send({
        query: `
        {
          director(id: "1") {
            id
            name
            birthday
            country
          }
        }
        `
      })
      .expect(200);

      assert.ok(res);
      assert.ok(res.body);
      assert.ok(res.body.data);
      assert.ok(res.body.data.director);
      assert.ok(res.body.data.director.id);
      assert.ok(res.body.data.director.name);
      assert.ok(res.body.data.director.birthday);
      assert.ok(res.body.data.director.country);
    });
  });
});
