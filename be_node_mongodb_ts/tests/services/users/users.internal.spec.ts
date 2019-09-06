import { assert } from 'chai';
import { rndKey, cleanup } from '../../_test-utils';
import { closeDB, initDB } from '../../../src/core/db';
import { createUser, getUserByEmail, getUser, getUsers } from '../../../src/services/users/users.utils';

// --------------------------------------------------
// methods

// --------------------------------------------------
// test suite

describe('\'users\' service: internal', () => {
  after(async () => await closeDB());
  beforeEach(async () => await initDB() && await cleanup());

  describe('getUserByEmail', () => {
    after(async () => await closeDB());
    beforeEach(async () => await initDB() && await cleanup());

    it('should error with non existent email', async () => {
      // prepare test
      await createUser(
        {
          name: rndKey(),
          email: `abc${rndKey()}+abc@abc${rndKey()}abc.com`
        },
      );

      // make the request
      let res;
      let resErr;

      try {
        res = await getUserByEmail(
          `abc${rndKey()}+abc@abc${rndKey()}abc.com`,
        );
      } catch (err) {
        resErr = err;
      }

      // set tests
      assert.isNotOk(res);
      assert.ok(resErr);
      assert.equal(resErr.code, 404);
    });

    it('runs', async () => {
      // prepare test
      const user = await createUser(
        {
          name: rndKey(),
          email: `abc${rndKey()}+abc@abc${rndKey()}abc.com`
        },
      );

      // make the request
      const res = await getUserByEmail(
        user.email,
      );

      assert.ok(res);
      assert.equal(res.name, user.name);
      assert.equal(res.email, user.email);
    });
  });

  describe('createUser', () => {
    it('should error if email null', async () => {
      const name = rndKey();

      // make the request
      let res;
      let resErr;

      try {
        res = await createUser({ name, email: <any>null, surname: 'Last' });
      } catch (err) {
        resErr = err;
      }

      // set tests
      assert.isNotOk(res);
      assert.ok(resErr);
      assert.equal(resErr.code, 400);
    });

    it('should error if email not valid', async () => {
      const name = rndKey();
      const email = `${rndKey()}`;

      // make the request
      let res;
      let resErr;

      try {
        res = await createUser({ name, email, surname: 'Last' });
      } catch (err) {
        resErr = err;
      }

      // set tests
      assert.isNotOk(res);
      assert.ok(resErr);
      assert.equal(resErr.code, 400);
    });

    it('runs', async () => {
      const name = rndKey();
      const email = `${rndKey()}@${rndKey()}.com`;

      // make the request
      let person = await createUser({ name, email, surname: 'Last' });
      assert.ok(person);
      assert.ok(person._id);
      assert.equal(typeof person._id, 'string');

      // request the full document now
      person = await getUser(person._id);

      assert.equal(person.name, name);
      assert.equal(person.surname, 'Last');
      assert.equal(person.email, email);
      assert.equal(person.isVerified, false);
    });
  });

  describe('getUser', () => {
    it('should error without a valid id', async () => {
      // prepare test
      const user = await createUser(
        {
          name: rndKey(),
          email: `abc${rndKey()}+abc@abc${rndKey()}abc.com`
        },
      );

      // make the request
      let res;
      let resErr;

      try {
        res = await getUser(
          rndKey(),
        );
      } catch (err) {
        resErr = err;
      }

      // set tests
      assert.isNotOk(res);
      assert.ok(resErr);
      assert.equal(resErr.code, 400);
    });

    it('runs', async () => {
      const user = await createUser(
        {
          name: rndKey(),
          email: `abc${rndKey()}+abc@abc${rndKey()}abc.com`
        },
      );

      // make the request
      const res = await getUser(user._id);

      assert.ok(res);
      assert.equal(res._id, user._id);
      assert.equal(typeof res._id, 'string');
      assert.equal(res.name, user.name);
      assert.equal(res.email, user.email);
      assert.equal(res.isVerified, false);
    });
  });

  describe('getUsers', () => {
    it('should error without a valid id', async () => {
      // prepare test
      const user = await createUser(
        {
          name: rndKey(),
          email: `abc${rndKey()}+abc@abc${rndKey()}abc.com`
        },
      );

      // make the request
      let res;
      let resErr;

      try {
        res = await getUsers(
          [rndKey()],
        );
      } catch (err) {
        resErr = err;
      }

      // set tests
      assert.isNotOk(res);
      assert.ok(resErr);
      assert.equal(resErr.code, 400);
    });

    it('runs', async () => {
      const user = await createUser(
        {
          name: rndKey(),
          email: `abc${rndKey()}+abc@abc${rndKey()}abc.com`
        },
      );

      // this one shouldn't appear
      await createUser(
        {
          name: rndKey(),
          email: `abc${rndKey()}+abc@abc${rndKey()}abc.com`
        },
      );

      // make the request
      const res = await getUsers([user._id]);

      assert.ok(res);
      assert.equal(res.length, 1);
      assert.equal(res[0]._id, user._id);
      assert.equal(typeof res[0]._id, 'string');
      assert.equal(res[0].name, user.name);
      assert.equal(res[0].email, user.email);
      assert.equal(res[0].isVerified, false);
    });
  });
});
