import { assert } from 'chai';
import { createToken, decodeToken } from '../../src/services/auth';

// --------------------------------------------------
// methods

// --------------------------------------------------
// test suite

describe('\'auth\' service', () => {
  describe('createToken', () => {
    it('runs', async () => {
      const res = await createToken('1');
      assert.ok(res);
      assert.ok(res.length > 0);
    });
  });

  describe('decodeToken', () => {
    it('should error', async () => {
      let res;
      let resErr;

      try {
        res = await decodeToken('1');
      } catch (err) {
        resErr = err;
      }

      // set tests
      assert.isNotOk(res);
      assert.ok(resErr);
    });

    it('runs', async () => {
      const userId = '1';
      const prepare = await createToken(userId);

      const res = await decodeToken(prepare);
      assert.ok(res);
      assert.ok(res.userId);
      assert.equal(res.userId, userId);
    });
  });
});
