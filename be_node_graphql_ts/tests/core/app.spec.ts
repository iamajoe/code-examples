import * as request from 'request-promise';
import { assert } from 'chai';
import { init, close } from '../../src/index';

// --------------------------------------------------
// methods

const rp = request.defaults({
  timeout: 120000,
  forever: true,
  pool: {
    maxSockets: Infinity
  },
  json: true,
  baseUrl: 'localhost:7000'
});

// --------------------------------------------------
// test suite

describe('\'app\' core', () => {
  it('runs', async () => {
    const res = await init({ hideLogs: true });
    assert.isOk(res);

    // close the server
    await close(res);
  });

  it('should error not allowed routes', async () => {
    const app = await init({ hideLogs: true });

    // make the request
    let res;

    try {
      res = await rp({
        url: 'foo-not-allowed-method',
        method: 'GET'
      });
    } catch (err) {
      res = err.error;
    }

    // set tests
    assert.ok(res);

    // close the server
    await close(app);
  });
});
