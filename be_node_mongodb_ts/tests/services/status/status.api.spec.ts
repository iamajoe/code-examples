import * as request from 'request-promise';
import { assert } from 'chai';
import { initApp, closeApp, getHost } from '../../_test-utils';

// --------------------------------------------------
// variables

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
// methods

// --------------------------------------------------
// test suite

describe('\'status\' service: api', () => {
  before(async () => await initApp());
  after(async () => await closeApp());

  describe('GET: /', () => {
    it('runs', async () => {
      const res = await rp({
        url: 'status',
        method: 'get'
      });

      assert.isOk(res);
      assert.isOk(res.ok);
      assert.equal(res.code, 200);
      assert.isOk(!res.err);

      const { data } = res;
      assert.isOk(data);
      assert.isOk(data.build);
      assert.isOk(data.build.version);
    });
  });
});
