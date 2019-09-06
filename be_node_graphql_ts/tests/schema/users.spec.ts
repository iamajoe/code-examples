import { assert } from 'chai';
import * as supertest from 'supertest';
import { init, close, IApp } from '../../src';
import { createUser } from 'src/services/users';

// --------------------------------------------------
// variables

let app: IApp;
let request;

// --------------------------------------------------
// test suite

describe('\'users\' schema', () => {
  before(async () => {
    app = await init({ hideLogs: true });
    request = supertest(`http://localhost:${app.port}`);
  });
  after(async () => {
    await close(app);
    (<any>app) = null;
    (<any>request) = null;
  });

  describe('createUser', () => {
    it('should error with same username', async () => {
      const name = `ABC-${Math.random() * 100000}`;
      const password = '1';
      await createUser(name, password);

      const res = await request.post('/graphql')
      .send({
        query: `
        mutation {
          createUser(username: \"${name}\", password: \"${password}\") {
            token
            user {
              id
              name
            }
          }
        }
        `
      });

      assert.ok(res);
      assert.ok(res.body);
      assert.ok(res.body.data);
      assert.ok(res.body.errors);
      assert.equal(res.body.errors.length, 1);
      assert.notOk(res.body.data.createUser);
    });

    it('creates an user and returns data', async () => {
      const name = `ABC-${Math.random() * 100000}`;
      const password = '1';

      const res = await request.post('/graphql')
      .send({
        query: `
        mutation {
          createUser(username: \"${name}\", password: \"${password}\") {
            token
            user {
              id
              name
            }
          }
        }
        `
      })
      .expect(200);

      assert.ok(res);
      assert.ok(res.body);
      assert.ok(res.body.data);
      assert.ok(res.body.data.createUser);
      assert.ok(res.body.data.createUser.token);
      assert.ok(res.body.data.createUser.token.length > 0);
      assert.ok(res.body.data.createUser.user);
      assert.ok(res.body.data.createUser.user.id);
      assert.equal(res.body.data.createUser.user.name, name);
    });
  });

  describe('login', () => {
    it('logins an user and returns data', async () => {
      const name = `ABC-${Math.random() * 100000}`;
      const password = '1';
      const user = await createUser(name, password);

      const res = await request.post('/graphql')
      .send({
        query: `
        mutation {
          login(username: \"${user.name}\", password: \"${password}\") {
            token
            user {
              id
              name
            }
          }
        }
        `
      })
      .expect(200);

      assert.ok(res);
      assert.ok(res.body);
      assert.ok(res.body.data);
      assert.ok(res.body.data.login);
      assert.ok(res.body.data.login.token);
      assert.ok(res.body.data.login.token.length > 0);
      assert.ok(res.body.data.login.user);
      assert.equal(res.body.data.login.user.id, user.id);
      assert.equal(res.body.data.login.user.name, user.name);
    });
  });
});
