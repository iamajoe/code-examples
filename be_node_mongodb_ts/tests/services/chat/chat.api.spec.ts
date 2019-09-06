import * as request from 'request-promise';
import * as io from 'socket.io-client';
import { assert } from 'chai';
import { initApp, closeApp, getHost, cleanup, rndKey, getConfig } from '../../_test-utils';
import { createChatRoom, getChatRoom } from '../../../src/services/chat/chat-rooms.utils';
import { createUser, login } from '../../../src/services/users/users.utils';
import { IApp } from '../../../src/app';

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
let clients: { user: any, client: any }[];

// --------------------------------------------------
// methods

// --------------------------------------------------
// test suite

describe('\'chat\' service: api', () => {
  before(async () => await initApp());
  after(async () => await closeApp());

  describe('POST: /room', () => {
    it('runs', async () => {
      const password = rndKey();
      const user = await createUser(
        {
          password,
          name: rndKey(),
          email: `abc${rndKey()}abc@abc${rndKey()}abc.com`,
          surname: 'Last',
        },
      );

      // login and set the token
      const accessToken = (await login(user.email, password)).token;

      const name = rndKey();

      // make the request
      const res = await rp({
        url: 'chat/room',
        method: 'POST',
        auth: {
          bearer: accessToken
        },
        body: {
          name,
          type: 'groups',
          membersList: [],
        }
      });

      assert.ok(res);
      assert.isOk(res.ok);
      assert.equal(res.code, 200);
      assert.isOk(!res.err);

      let room = res.data;
      assert.ok(room);
      assert.ok(room._id);
      assert.equal(typeof room._id, 'string');

      // request the full document now
      room = await getChatRoom(room._id);
      assert.ok(room);
      assert.equal(room.name, name);
      assert.equal(room.membersList.length, 0);
    });
  });

  describe('GET: /room/:id', () => {
    it('runs', async () => {
      const password = rndKey();
      const user = await createUser(
        {
          password,
          name: rndKey(),
          email: `abc${rndKey()}abc@abc${rndKey()}abc.com`,
          surname: 'Last',
        },
      );
      const room = await createChatRoom(
        {
          name: rndKey(),
          type: 'groups',
          membersList: [{ userId: user._id }]
        },
      );

      // login and set the token
      const accessToken = (await login(user.email, password)).token;

      // make the request
      const res = await rp({
        url: `chat/room/${room._id}`,
        method: 'GET',
        auth: {
          bearer: accessToken
        },
      });

      assert.ok(res);
      assert.isOk(res.ok);
      assert.equal(res.code, 200);
      assert.isOk(!res.err);

      const resRoom = res.data;
      assert.ok(resRoom);
      assert.equal(resRoom.name, room.name);
      assert.equal(resRoom.membersList.length, room.membersList.length);
    });
  });

  describe('PATCH: /room/:id', () => {
    it('runs', async () => {
      const password = rndKey();
      const user = await createUser(
        {
          password,
          name: rndKey(),
          email: `abc${rndKey()}abc@abc${rndKey()}abc.com`,
          surname: 'Last',
        },
      );
      const room = await createChatRoom(
        {
          name: rndKey(),
          type: 'groups',
          membersList: [{ userId: user._id }]
        },
      );

      // login and set the token
      const accessToken = (await login(user.email, password)).token;

      const secondName = rndKey();

      // make the request
      const res = await rp({
        url: `chat/room/${room._id}`,
        method: 'PATCH',
        auth: {
          bearer: accessToken
        },
        body: {
          name: secondName
        }
      });

      assert.ok(res);
      assert.isOk(res.ok);
      assert.equal(res.code, 200);
      assert.isOk(!res.err);

      let resRoom = res.data;
      assert.ok(resRoom);
      assert.equal(resRoom._id, room._id);
      assert.equal(typeof resRoom._id, 'string');

      // request the full document now
      resRoom = await getChatRoom(room._id);
      assert.ok(resRoom);
      assert.equal(resRoom.name, secondName);
      assert.equal(resRoom.membersList.length, room.membersList.length);
    });
  });

  describe('DELETE: /room/:id', () => {
    it('runs', async () => {
      const password = rndKey();
      const user = await createUser(
        {
          password,
          name: rndKey(),
          email: `abc${rndKey()}abc@abc${rndKey()}abc.com`,
          surname: 'Last',
        },
      );
      const room = await createChatRoom(
        {
          name: rndKey(),
          type: 'groups',
          membersList: [{ userId: user._id }]
        },
      );

      // login and set the token
      const accessToken = (await login(user.email, password)).token;

      // make the request
      const res = await rp({
        url: `chat/room/${room._id}`,
        method: 'DELETE',
        auth: {
          bearer: accessToken
        }
      });

      assert.ok(res);
      assert.isOk(res.ok);
      assert.equal(res.code, 200);
      assert.isOk(!res.err);
      assert.ok(res.data);

      // request the full document now
      try {
        const evt = await getChatRoom(room._id);
        assert.isNotOk(evt);
      } catch (err) {
        // DEV: nothing to do here, it should be fine since this shouldn't
        //      retrieve anything but an error for something that doesn't
        //      exist
      }
    });
  });

  describe('GET: /get-room-messages', () => {
    it('runs without data', async () => {
      // force to be clean
      await cleanup();

      // prepare test
      const userEmail = `${rndKey()}@${rndKey()}.com`;
      const userPassword = '123457890';
      const user = await createUser(
        {
          name: rndKey(),
          email: userEmail,
          password: userPassword,
          surname: 'Last',
        },
      );

      // login and set the token
      const accessToken = (await login(userEmail, userPassword)).token;

      const room = await createChatRoom(
        {
          name: rndKey(),
          type: 'groups',
          membersList: [
            { userId: user._id }
          ]
        },
      );

      // make the request
      const res = await rp({
        url: `chat/get-room-messages/${room._id}`,
        method: 'GET',
        auth: {
          bearer: accessToken
        },
      });

      assert.ok(res);
      assert.isOk(res.ok);
      assert.equal(res.code, 200);
      assert.isOk(!res.err);
      assert.equal(res.data.length, 0);
    });
  });

  describe('GET: /get-user-rooms-one-on-one', () => {
    it('should error without a token', async() => {
      const userEmail = `${rndKey()}@${rndKey()}.com`;
      const userPassword = '123456980908';
      const user = await createUser(
        {
          name: rndKey(),
          email: userEmail,
          password: userPassword,
          surname: 'Last',
        },
      );

      const user2 = await createUser(
        {
          name: rndKey(),
          email: `abc${rndKey()}abc@abc${rndKey()}abc.com`,
          surname: 'Last',
        },
      );

      // set the group
      const roomName = rndKey();
      await createChatRoom(
        {
          name: roomName,
          membersList: [
            { userId: user._id },
            { userId: user2._id }
          ],
          type: 'oneonone',
        },
      );

      // make the request
      let res;

      try {
        res = await rp({
          url: `chat/get-user-rooms-one-on-one`,
          method: 'GET'
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
      const user = await createUser(
        {
          name: rndKey(),
          email: `${rndKey()}@${rndKey()}.com`,
          password: rndKey(),
          surname: 'Last',
        },
      );

      const user2 = await createUser(
        {
          name: rndKey(),
          email: `abc${rndKey()}abc@abc${rndKey()}abc.com`,
          surname: 'Last',
        },
      );

      // set the group
      const roomName = rndKey();
      await createChatRoom(
        {
          name: roomName,
          membersList: [
            { userId: user._id },
            { userId: user2._id }
          ],
          type: 'groups',
        },
      );

      // prepare test
      const outUserEmail = `${rndKey()}@${rndKey()}.com`;
      const outUserPassword = '123457890';
      await createUser(
        {
          name: rndKey(),
          email: outUserEmail,
          password: outUserPassword,
          surname: 'Last',
        },
      );

      // login and set the token
      const accessToken = (await login(outUserEmail, outUserPassword)).token;

      // make the request
      const res = await rp({
        url: `chat/get-user-rooms-one-on-one`,
        method: 'GET',
        auth: {
          bearer: accessToken
        },
      });

      assert.ok(res);
      assert.isOk(res.ok);
      assert.equal(res.code, 200);
      assert.isOk(!res.err);
      assert.equal(res.data.length, 0);

      assert.ok(res.computed);
      assert.isNotOk(res.computed.messages);
    });
  });

  describe('GET: /get-user-rooms-groups', () => {
    it('should error without a token', async() => {
      const userEmail = `${rndKey()}@${rndKey()}.com`;
      const userPassword = '123456980908';
      const user = await createUser(
        {
          name: rndKey(),
          email: userEmail,
          password: userPassword,
          surname: 'Last',
        },
      );

      const user2 = await createUser(
        {
          name: rndKey(),
          email: `abc${rndKey()}abc@abc${rndKey()}abc.com`,
          surname: 'Last',
        },
      );

      // set the group
      const roomName = rndKey();
      await createChatRoom(
        {
          name: roomName,
          membersList: [
            { userId: user._id },
            { userId: user2._id }
          ],
          type: 'groups',
        },
      );

      // make the request
      let res;

      try {
        res = await rp({
          url: `chat/get-user-rooms-groups`,
          method: 'GET'
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
      const user = await createUser(
        {
          name: rndKey(),
          email: `${rndKey()}@${rndKey()}.com`,
          password: rndKey(),
          surname: 'Last',
        },
      );

      const user2 = await createUser(
        {
          name: rndKey(),
          email: `abc${rndKey()}abc@abc${rndKey()}abc.com`,
          surname: 'Last',
        },
      );

      // set the group
      const roomName = rndKey();
      await createChatRoom(
        {
          name: roomName,
          membersList: [
            { userId: user._id },
            { userId: user2._id }
          ],
          type: 'groups',
        },
      );

      // prepare test
      const outUserEmail = `${rndKey()}@${rndKey()}.com`;
      const outUserPassword = '123457890';
      await createUser(
        {
          name: rndKey(),
          email: outUserEmail,
          password: outUserPassword,
          surname: 'Last',
        },
      );

      // login and set the token
      const accessToken = (await login(outUserEmail, outUserPassword)).token;

      // make the request
      const res = await rp({
        url: `chat/get-user-rooms-groups`,
        method: 'GET',
        auth: {
          bearer: accessToken
        },
      });

      assert.ok(res);
      assert.isOk(res.ok);
      assert.equal(res.code, 200);
      assert.isOk(!res.err);

      // DEV: this user doesn't have access to the society
      assert.ok(res.data.length === 0);
    });
  });

  describe('SOCKET: /chat', () => {
    describe('connect', () => {
      const prepare = async () => {
        const password = rndKey();

        // prepare test
        const user = await createUser(
          {
            password,
            name: rndKey(),
            email: `abc${rndKey()}abc@abc${rndKey()}abc.com`,
          },
        );

        return {
          user,
          accessToken: (await login(user.email, password)).token
        };
      };

      it('should error without a token', () => {
        const socketURL = <string>getConfig().builtHost;
        const socketOptions = {
          path: '/chat/socket',
          transports: ['websocket'],
          'force new connection': true
        };

        try {
          clients = [{
            user: null,
            client: io.connect(socketURL, socketOptions)
          }];
        } catch (err) {
          // DEV: all as expected, it should error!
        }

        // set the promise to check
        return new Promise((resolve, reject) => {
          let setErr = false;

          // wait for the client connection
          clients[0].client.on('connect', () => {
            setErr = true;
          });

          // we are expecting an error
          clients[0].client.on('error', () => {
            setErr = false;
          });

          setTimeout(() => resolve(setErr), 5000);
        })
        .then((setErr) => {
          // all as expected
          if (!setErr) { return null; }

          throw new Error('it shouldn\'t connect');
        });
      });

      it('runs', async () => {
        const user1 = await prepare();
        const socketURL = getConfig().builtHost;
        const socketOptions = {
          path: '/chat/socket',
          transports: ['websocket'],
          'force new connection': true
        };

        clients = [{
          user: user1,
          client: io.connect(`${socketURL}?token=${user1.accessToken}`, socketOptions)
        }];

        // set the promise to check
        const p = new Promise((resolve, reject) => {
          let err = true;

          // wait for the client connection
          clients[0].client.on('connect', () => {
            err = false;
            resolve();
          });

          // wait for a bit
          setTimeout(() => err && reject('timer has passed and no connection'), 3000);
        });

        return await p;
      });
    });

    describe('message', () => {
      beforeEach(async () => await cleanup());

      const prepare = async () => {
        // being tests we can create with the bot
        const password = rndKey();
        const user = await createUser(
          {
            password,
            name: rndKey(),
            email: `abc${rndKey()}abc@abc${rndKey()}abc.com`,
            surname: rndKey(),
          },
        );
        const user1 = await createUser(
          {
            password,
            name: rndKey(),
            email: `abc${rndKey()}abc@abc${rndKey()}abc.com`,
            surname: rndKey(),
          },
        );
        const user2 = await createUser(
          {
            password,
            name: rndKey(),
            email: `abc${rndKey()}abc@abc${rndKey()}abc.com`,
            surname: rndKey(),
          },
        );
        const user3 = await createUser(
          {
            password,
            name: rndKey(),
            email: `abc${rndKey()}abc@abc${rndKey()}abc.com`,
            surname: rndKey(),
          },
        );

        const users = [user, user1, user2, user3];
        const room = await createChatRoom(
          {
            name: rndKey(),
            membersList: [
              { userId: user1._id },
              { userId: user2._id },
              { userId: user3._id }
            ],
            type: 'oneonone',
          },
        );

        const socketURL = getConfig().builtHost;
        const socketOptions = {
          path: '/chat/socket',
          transports: ['websocket'],
          'force new connection': true
        };

        // create the clients
        clients = [];
        for (let i = 0; i < users.length; i += 1) {
          const token = (await login(users[i].email, password)).token;
          const client = io.connect(`${socketURL}?token=${token}`, socketOptions);

          // wait for the connection
          (await new Promise((resolve) => {
            client.on('connect', () => { resolve(); });
          }));

          clients.push({ client, user: users[i] });
        }

        return {
          room,
          users,
          clients
        };
      };

      it('runs and notifies the right people', async () => {
        // prepare test
        const prepareData = await prepare();
        const { room } = prepareData;

        const messageSent = rndKey();
        const emitterIndex = 1;
        const receivedCount = 2;
        let checked = 0;

        clients[0].client.on('receive:message', () => {
          throw new Error('this client\'t shouldn\'t receive a message');
        });

        clients[1].client.on('receive:message', (data: any) => {
          throw new Error('this client\'t shouldn\'t receive a message');
        });

        clients[2].client.on('receive:message', (data: any) => {
          assert.equal(data.authorId, clients[1].user._id);
          assert.equal(data.roomId, room._id);
          assert.equal(data.message, messageSent);
          checked += 1;
        });

        clients[3].client.on('receive:message', (data: any) => {
          assert.equal(data.authorId, clients[1].user._id);
          assert.equal(data.roomId, room._id);
          assert.equal(data.message, messageSent);
          checked += 1;
        });

        // wait a bit just so that all sockets have the right listeners
        await (new Promise(resolve => setTimeout(resolve, 500)));

        // send the message
        clients[emitterIndex].client.emit('send:message', {
          roomId: room._id,
          message: messageSent
        });

        // set a simple timer promise so that all event messages come in
        await (new Promise(resolve => setTimeout(resolve, 500)));

        assert.equal(checked, receivedCount);
      });
    });
  });
});
