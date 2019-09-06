import * as request from 'request-promise';
import { assert } from 'chai';
import { getHost, closeApp } from '../_test-utils';
import { init } from '../../src/app';

// --------------------------------------------------
// methods

const rp = request.defaults({
  timeout: 120000,
  forever: true,
  pool: {
    maxSockets: Infinity
  },
  json: true,
  baseUrl: getHost()
});

// --------------------------------------------------
// test suite

describe('\'app\' core', () => {
  it('runs', async () => {
    const res = await init({ hideLogs: true });
    assert.isOk(res);
    assert.isObject(res);
    assert.isOk(res.lib);
    assert.isOk(res.server);

    // close the server
    await closeApp(res);
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
    assert.isNotOk(res.ok);
    assert.equal(res.code, 405);
    assert.isOk(res.err);
    assert.isNotOk(res.data);

    // close the server
    await closeApp(app);
  });
});
