import { assert } from 'chai';
import * as supertest from 'supertest';
import { init, close, IApp } from '../../src';

// --------------------------------------------------
// variables

let app: IApp;
let request;

// --------------------------------------------------
// test suite

describe('\'actors\' schema', () => {
  before(async () => {
    app = await init({ hideLogs: true });
    request = supertest(`http://localhost:${app.port}`);
  });
  after(async () => {
    await close(app);
    (<any>app) = null;
    (<any>request) = null;
  });

  describe('actor', () => {
    it('returns actor', async () => {
      const res = await request.post('/graphql')
      .send({
        query: `
        {
          actor(id: "1") {
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
      assert.ok(res.body.data.actor);
      assert.ok(res.body.data.actor.id);
      assert.ok(res.body.data.actor.name);
      assert.ok(res.body.data.actor.birthday);
      assert.ok(res.body.data.actor.country);
    });
  });
});
