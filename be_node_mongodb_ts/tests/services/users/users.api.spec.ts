import * as request from 'request-promise';
import { assert } from 'chai';
import { initApp, closeApp, getHost, rndKey } from '../../_test-utils';
import { init as getUserModel } from '../../../src/models/users.model';
import { createUser, login, getUser, sendResetPassword } from '../../../src/services/users/users.utils';

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

describe('\'users\' service: api', () => {
  before(async () => await initApp());
  after(async () => await closeApp());

  describe('POST: /verify-user', () => {
    const prepare = async () => {
      const name = rndKey();
      const email = `abc${rndKey()}abc@abc${rndKey()}abc.com`;
      const password = rndKey();

      // prepare test
      const user = await createUser(
        {
          name,
          email,
          password,
          surname: 'Last'
        },
      );

      // make sure we get the user token
      const Model = getUserModel();
      const { verifyToken } = await Model.findOne({ _id: user._id }).lean().exec();

      return {
        user,
        password,
        verifyToken
      };
    };

    it('should error without a registered user email', async () => {
      const name = rndKey();
      const email = `${rndKey()}@${rndKey()}.com`;

      // prepare test
      await createUser(
        {
          name,
          email,
          surname: 'Last',
        },
      );

      // make the request
      let res;

      try {
        res = await rp({
          url: 'users/verify-user',
          method: 'POST',
          body: {
            email: `abc${rndKey()}abc@abc${rndKey()}abc.com`,
            code: 'foo'
          }
        });
      } catch (err) {
        res = err.error;
      }

      // set tests
      assert.ok(res);
      assert.isNotOk(res.ok);
      assert.equal(res.code, 400);
      assert.isOk(res.err);
      assert.isNotOk(res.data);
    });

    it('should error without the right code', async () => {
      const name = rndKey();
      const email = `${rndKey()}@${rndKey()}.com`;

      // prepare test
      await createUser(
        {
          name,
          email,
          surname: 'Last',
        },
      );

      // make the request
      let res;

      try {
        res = await rp({
          url: 'users/verify-user',
          method: 'POST',
          body: {
            email,
            code: 'foo'
          }
        });
      } catch (err) {
        res = err.error;
      }

      assert.ok(res);
      assert.isNotOk(res.ok);
      assert.equal(res.code, 400);
      assert.isOk(res.err);
      assert.isNotOk(res.data);
    });

    it('runs', async () => {
      // prepare test
      const prepareUser = await prepare();

      // make the request
      const res = await rp({
        url: 'users/verify-user',
        method: 'POST',
        body: {
          email: prepareUser.user.email,
          code: prepareUser.verifyToken
        }
      });

      assert.ok(res);
      assert.isOk(res.ok);
      assert.equal(res.code, 200);
      assert.isOk(!res.err);
      assert.isOk(res.data);

      // DEV: wait over 1s because of the cache
      await (new Promise(resolve => setTimeout(() => resolve(), 1200)));

      // check if user is as expected
      const user = await getUser(prepareUser.user._id);

      assert.equal(user.isVerified, true);
    });
  });

  describe('POST: /resend-verify-code', () => {
    it('should error without an email', async () => {
      // prepare test
      (await createUser(
        {
          name: rndKey(),
          email: `${rndKey()}@${rndKey()}.com`,
          surname: 'Last',
        },
      ));

      // make the request
      let res;

      try {
        res = await rp({
          url: `users/resend-verify-code`,
          method: 'POST',
        });
      } catch (err) {
        res = err.error;
      }

      // set tests
      assert.ok(res);
      assert.isNotOk(res.ok);
      assert.equal(res.code, 400);
      assert.isOk(res.err);
      assert.isNotOk(res.data);
    });

    it('runs and changes verification code', async () => {
      // prepare test
      const user = (await createUser(
        {
          name: rndKey(),
          email: `${rndKey()}@${rndKey()}.com`,
          surname: 'Last',
        },
      ));

      const Model = getUserModel();
      const oldUser = await Model.findOne({ _id: user._id }).lean().exec();

      // make the request
      const res = await rp({
        url: 'users/resend-verify-code',
        method: 'POST',
        body: {
          email: user.email
        }
      });

      assert.ok(res);
      assert.isOk(res.ok);
      assert.equal(res.code, 200);
      assert.isOk(!res.err);
      assert.isOk(res.data);

      // check if user is as expected
      const userUpdated = await Model.findOne({ _id: user._id }).lean().exec();

      assert.notEqual(oldUser.verifyShortToken, userUpdated.verifyShortToken);
      assert.notEqual(oldUser.verifyToken, userUpdated.verifyToken);
    });
  });

  describe('POST: /send-reset-password', () => {
    it('should error without an email', async () => {
      // prepare test
      (await createUser(
        {
          name: rndKey(),
          email: `${rndKey()}@${rndKey()}.com`,
        },
      ));

      // make the request
      let res;

      try {
        res = await rp({
          url: `users/send-reset-password`,
          method: 'POST',
        });
      } catch (err) {
        res = err.error;
      }

      // set tests
      assert.ok(res);
      assert.isNotOk(res.ok);
      assert.equal(res.code, 400);
      assert.isOk(res.err);
      assert.isNotOk(res.data);
    });

    it('runs and changes reset code', async () => {
      // prepare test
      const user = (await createUser(
        {
          name: rndKey(),
          email: `${rndKey()}@${rndKey()}.com`,
        },
      ));

      const Model = getUserModel();
      const oldUser = await Model.findOne({ _id: user._id }).lean().exec();

      // make the request
      const res = await rp({
        url: 'users/send-reset-password',
        method: 'POST',
        body: {
          email: user.email
        }
      });

      assert.ok(res);
      assert.isOk(res.ok);
      assert.equal(res.code, 200);
      assert.isOk(!res.err);
      assert.isOk(res.data);

      // check if user is as expected
      const userUpdated = await Model.findOne({ _id: user._id }).lean().exec();

      assert.notEqual(oldUser.resetShortToken, userUpdated.resetShortToken);
      assert.notEqual(oldUser.resetToken, userUpdated.resetToken);
    });
  });

  describe('POST: /reset-password', () => {
    const prepare = async () => {
      const name = rndKey();
      const email = `abc${rndKey()}abc@abc${rndKey()}abc.com`;
      const password = rndKey();

      // prepare test
      let user = await createUser(
        {
          name,
          email,
          password,
          surname: 'Last'
        },
      );

      // setup the reset password
      await sendResetPassword(email);

      // do it here so we can override the is bot
      user = await getUser(user._id);

      return {
        user,
        password,
        verifyToken: user.verifyToken
      };
    };

    it('should error without an email', async () => {
      // prepare test
      await prepare();

      // make the request
      let res;

      try {
        res = await rp({
          url: `users/reset-password`,
          method: 'POST',
        });
      } catch (err) {
        res = err.error;
      }

      // set tests
      assert.ok(res);
      assert.isNotOk(res.ok);
      assert.equal(res.code, 400);
      assert.isOk(res.err);
      assert.isNotOk(res.data);
    });

    it('should error without the right code', async () => {
      // prepare test
      const data = await prepare();
      const nPassword = rndKey();

      // make the request
      let res;

      try {
        res = await rp({
          url: `users/reset-password`,
          method: 'POST',
          body: {
            email: data.user.email,
            code: '0123',
            password: nPassword
          }
        });
      } catch (err) {
        res = err.error;
      }

      // set tests
      assert.ok(res);
      assert.isNotOk(res.ok);
      assert.equal(res.code, 400);
      assert.isOk(res.err);
      assert.isNotOk(res.data);
    });

    it('runs and changes password', async () => {
      // prepare test
      const data = await prepare();
      const nPassword = rndKey();

      const Model = getUserModel();
      const oldUser = await Model.findOne({ _id: data.user._id }).lean().exec();

      // make the request
      const res = await rp({
        url: `users/reset-password`,
        method: 'POST',
        body: {
          email: data.user.email,
          code: oldUser.resetShortToken,
          password: nPassword
        }
      });

      assert.ok(res);
      assert.isOk(res.ok);
      assert.equal(res.code, 200);
      assert.isOk(!res.err);
      assert.isOk(res.data);

      // make sure that we can login with the new password
      await login(data.user.email, nPassword);
    });
  });

  describe('POST: /login', () => {
    const prepare = async () => {
      // prepare test
      const password = rndKey();
      const user = await createUser(
        <any>{
          password,
          name: rndKey(),
          email: `abc${rndKey()}abc@abc${rndKey()}abc.com`,
          surname: 'Last',
          isVerified: true
        },
      );

      return {
        user,
        password
      };
    };

    it('should error without a registered user email', async () => {
      // make the request
      let res;

      try {
        res = await rp({
          url: 'users/login',
          method: 'POST',
          body: {
            email: `abc${rndKey()}abc@abc${rndKey()}abc.com`,
            password: rndKey()
          }
        });
      } catch (err) {
        res = err.error;
      }

      // set tests
      assert.ok(res);
      assert.isNotOk(res.ok);
      assert.equal(res.code, 401);
      assert.isOk(res.err);
      assert.isNotOk(res.data);
    });

    it('should error without the right password', async () => {
      // prepare test
      const userData = await prepare();

      // make the request
      let res;

      try {
        res = await rp({
          url: 'users/login',
          method: 'POST',
          body: {
            email: userData.user.email,
            password: rndKey()
          }
        });
      } catch (err) {
        res = err.error;
      }

      // set tests
      assert.ok(res);
      assert.isNotOk(res.ok);
      assert.equal(res.code, 401);
      assert.isOk(res.err);
      assert.isNotOk(res.data);
    });

    it('runs', async () => {
      // prepare test
      const userData = await prepare();

      // make the request
      const res = await rp({
        url: 'users/login',
        method: 'POST',
        body: {
          email: userData.user.email,
          password: userData.password
        }
      });

      assert.ok(res);
      assert.isOk(res.ok);
      assert.equal(res.code, 200);
      assert.isOk(!res.err);
      assert.isOk(res.data);
      assert.isOk(res.data.token);
      assert.isOk(res.data.user);
      assert.isString(res.data.token);
      assert.ok(res.data.token.length > 0);
      assert.isObject(res.data.user);
      assert.isOk(res.data.user._id);
    });
  });

  describe('POST: /user', () => {
    it('runs', async () => {
      const name = rndKey();
      const email = `${rndKey()}@${rndKey()}.com`;

      // make the request
      const res = await rp({
        url: 'users/user',
        method: 'POST',
        body: {
          name,
          email,
          surname: 'Last',
        }
      });

      assert.ok(res);
      assert.isOk(res.ok);
      assert.equal(res.code, 200);
      assert.isOk(!res.err);

      let person = res.data;
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

  describe('GET: /user/:id', () => {
    it('runs', async () => {
      const name = rndKey();
      const email = `${rndKey()}@${rndKey()}.com`;

      // prepare
      const password = rndKey();
      const user1 = await createUser(
        {
          name,
          email,
          password,
          surname: 'Last',
        },
      );
      const accessToken = (await login(user1.email, password)).token;

      // make the request
      const res = await rp({
        url: `users/user/${user1._id}`,
        method: 'GET',
        auth: {
          bearer: accessToken
        },
      });

      assert.ok(res);
      assert.isOk(res.ok);
      assert.equal(res.code, 200);
      assert.isOk(!res.err);

      const person = res.data;
      assert.ok(person);
      assert.equal(person._id, user1._id);
      assert.equal(typeof person._id, 'string');
      assert.equal(person.name, name);
      assert.equal(person.surname, 'Last');
      assert.equal(person.email, email);
      assert.equal(person.isVerified, false);
    });
  });

  describe('PATCH: /user/:id', () => {
    const prepare = async () => {
      const password = rndKey();

      // prepare test
      const user = await createUser(
        {
          password,
          name: rndKey(),
          email: `abc${rndKey()}abc@abc${rndKey()}abc.com`,
          surname: 'Last',
        },
      );

      return {
        user,
        accessToken: (await login(user.email, password)).token
      };
    };

    it('should error without auth user being verified', async () => {
      const secondName = rndKey();

      // prepare test
      const user = await createUser(
        <any>{
          name: rndKey(),
          email: `abc${rndKey()}abc@abc${rndKey()}abc.com`,
          password: rndKey(),
          surname: 'Last',
          isVerified: true
        },
      );

      // make the request
      let res;

      try {
        res = await rp({
          url: `users/user/${user._id}`,
          method: 'PATCH',
          body: {
            name: secondName
          }
        });
      } catch (err) {
        res = err.error;
      }

      // set tests
      assert.ok(res);
      assert.isNotOk(res.ok);
      assert.equal(res.code, 401);
      assert.isOk(res.err);
      assert.isNotOk(res.data);
    });

    it('should error without auth user same as id', async () => {
      const secondName = rndKey();

      // prepare test
      const user = await createUser(
        <any>{
          name: rndKey(),
          email: `abc${rndKey()}abc@abc${rndKey()}abc.com`,
          password: rndKey(),
          surname: 'Last',
          isVerified: true
        },
      );

      // prepare test
      const user2Password = rndKey();
      const user2 = await createUser(
        <any>{
          name: rndKey(),
          email: `abc${rndKey()}abc@abc${rndKey()}abc.com`,
          password: user2Password,
          surname: 'Last',
          isVerified: true
        },
      );
      const accessToken = (await login(user2.email, user2Password)).token;

      // make the request
      let res;

      try {
        res = await rp({
          url: `users/user/${user._id}`,
          method: 'PATCH',
          auth: {
            bearer: accessToken
          },
          body: {
            name: secondName
          }
        });
      } catch (err) {
        res = err.error;
      }

      // set tests
      assert.ok(res);
      assert.isNotOk(res.ok);
      assert.equal(res.code, 401);
      assert.isOk(res.err);
      assert.isNotOk(res.data);
    });

    it('runs', async () => {
      const secondName = rndKey();

      // prepare test
      const prepareData = await prepare();

      // make the request
      const res = await rp({
        url: `users/user/${prepareData.user._id}`,
        method: 'PATCH',
        auth: {
          bearer: <any>prepareData.accessToken
        },
        body: {
          name: secondName
        }
      });

      assert.ok(res);
      assert.isOk(res.ok);
      assert.equal(res.code, 200);
      assert.isOk(!res.err);

      let person = res.data;
      assert.ok(person);
      assert.equal(person._id, prepareData.user._id);
      assert.equal(typeof person._id, 'string');

      // request the full document now
      person = await getUser(person._id);

      assert.equal(person.name, secondName);
      assert.equal(person.surname, 'Last');
      assert.equal(person.email, prepareData.user.email);
      assert.equal(person.isVerified, false);
    });

    it('runs but doesn\'t patch the password if old isn\'t the same', async () => {
      // prepare test
      const userPassword = rndKey();
      const user = await createUser(
        <any>{
          name: rndKey(),
          email: `abc${rndKey()}abc@abc${rndKey()}abc.com`,
          password: userPassword,
          isVerified: true
        },
      );
      const accessToken = (await login(user.email, userPassword)).token;
      const userNewPassword = rndKey();

      // make the request
      const res = await rp({
        url: `users/user/${user._id}`,
        method: 'PATCH',
        auth: {
          bearer: accessToken
        },
        body: {
          password: userNewPassword
        }
      });

      assert.ok(res);
      assert.isOk(res.ok);
      assert.equal(res.code, 200);
      assert.isOk(!res.err);

      let person = res.data;
      assert.ok(person);
      assert.equal(person._id, user._id);
      assert.equal(typeof person._id, 'string');

      // request the full document now
      person = await getUser(person._id);

      assert.equal(person.name, user.name);
      assert.equal(person.email, user.email);
      assert.equal(person.isVerified, true);
      assert.notEqual(person.password, userPassword);
      assert.equal(person.password, user.password);
    });

    it('runs and patches the password if user same id and good old password', async () => {
      // prepare test
      const userPassword = rndKey();
      const user = await createUser(
        <any>{
          name: rndKey(),
          email: `abc${rndKey()}abc@abc${rndKey()}abc.com`,
          password: userPassword,
          isVerified: true
        },
      );
      const accessToken = (await login(user.email, userPassword)).token;
      const userNewPassword = rndKey();

      // make the request
      const res = await rp({
        url: `users/user/${user._id}?oldPassword=${userPassword}`,
        method: 'PATCH',
        auth: {
          bearer: accessToken
        },
        body: {
          password: userNewPassword
        }
      });

      assert.ok(res);
      assert.isOk(res.ok);
      assert.equal(res.code, 200);
      assert.isOk(!res.err);

      let person = res.data;
      assert.ok(person);
      assert.equal(person._id, user._id);
      assert.equal(typeof person._id, 'string');

      // request the full document now
      const Model = getUserModel();
      person = await Model.findOne({ _id: user._id }).lean().exec();

      assert.equal(person.name, user.name);
      assert.equal(person.email, user.email);
      assert.equal(person.isVerified, true);
      assert.notEqual(person.password, userPassword);
      assert.notEqual(person.password, user.password);
      assert.notEqual(person.password, `${userNewPassword}`);

      // set so we know that we're able to login with the new password
      (await login(user.email, userNewPassword));
    });
  });

  describe('POST: /users', () => {
    it('runs', async () => {
      const name = rndKey();
      const email = `${rndKey()}@${rndKey()}.com`;

      // prepare
      const password = rndKey();
      const user1 = await createUser(
        {
          name,
          email,
          password,
          surname: 'Last',
        },
      );
      const accessToken = (await login(user1.email, password)).token;

      // make the request
      const res = await rp({
        url: `users/users`,
        method: 'POST',
        body: {
          ids: [user1._id]
        },
        auth: {
          bearer: accessToken
        },
      });

      assert.ok(res);
      assert.isOk(res.ok);
      assert.equal(res.code, 200);
      assert.isOk(!res.err);

      const people = res.data;
      assert.ok(people);
      assert.equal(people.length, 1);
      assert.equal(people[0]._id, user1._id);
      assert.equal(typeof people[0]._id, 'string');
      assert.equal(people[0].name, name);
      assert.equal(people[0].surname, 'Last');
      assert.equal(people[0].email, email);
      assert.equal(people[0].isVerified, false);
    });
  });

  describe('GET: /get-user-by-email', () => {
    it('runs', async () => {
      // prepare test
      const password = rndKey();
      const user1 = await createUser(
        {
          password,
          name: rndKey(),
          email: `abc${rndKey()}abc@abc${rndKey()}abc.com`
        },
      );

      // login and set the token
      const accessToken = (await login(user1.email, password)).token;

      // make the request
      const res = await rp({
        url: `users/get-user-by-email?email=${user1.email}`,
        method: 'GET',
        auth: { bearer: accessToken },
      });

      assert.ok(res);
      assert.isOk(res.ok);
      assert.equal(res.code, 200);
      assert.isOk(!res.err);

      assert.ok(res.data);
      assert.equal(res.data.name, user1.name);
      assert.equal(res.data.email, user1.email);
    });
  });

  describe('GET: /is-email-registered', () => {
    it('runs and retrieves false when not registered', async () => {
      // make the request
      const res = await rp({
        url: `users/is-email-registered?email=abc${rndKey()}abc@abc${rndKey()}abc.com`,
        method: 'GET',
      });

      assert.ok(res);
      assert.isOk(res.ok);
      assert.equal(res.code, 200);
      assert.isOk(!res.err);

      assert.equal(res.data, false);
    });

    it('runs and retrieves true when registered', async () => {
      // prepare test
      const user1 = await createUser(
        {
          name: rndKey(),
          email: `abc${rndKey()}abc@abc${rndKey()}abc.com`
        },
      );

      // make the request
      const res = await rp({
        url: `users/is-email-registered?email=${user1.email}`,
        method: 'GET'
      });

      assert.ok(res);
      assert.isOk(res.ok);
      assert.equal(res.code, 200);
      assert.isOk(!res.err);

      assert.equal(res.data, true);
    });

    it('runs and retrieves true when registered with a +', async () => {
      // prepare test
      const user1 = await createUser(
        {
          name: rndKey(),
          email: `abc${rndKey()}+abc@abc${rndKey()}abc.com`
        },
      );

      // make the request
      const res = await rp({
        url: `users/is-email-registered?email=${user1.email}`,
        method: 'GET'
      });

      assert.ok(res);
      assert.isOk(res.ok);
      assert.equal(res.code, 200);
      assert.isOk(!res.err);

      assert.equal(res.data, true);
    });
  });
});
