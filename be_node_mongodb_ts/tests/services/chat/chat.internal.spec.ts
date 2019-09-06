import { assert } from 'chai';
import { rndKey, cleanup } from '../../_test-utils';
import { initDB, closeDB, getDB } from '../../../src/core/db';
import { createUser } from '../../../src/services/users/users.utils';
import {
  getTotal as getRoomsTotal,
  createChatRoom,
  getChatRoom,
  patchChatRoom,
  delChatRoom,
  getPerType,
} from '../../../src/services/chat/chat-rooms.utils';
import {
  getTotal as getMessagesTotal, createChatMessage,
  getRoomMessages,
  getChatMessage,
} from '../../../src/services/chat/chat-messages.utils';

// --------------------------------------------------
// methods

// --------------------------------------------------
// test suite

describe('\'chat\' service: internal', () => {
  after(async () => await closeDB());
  beforeEach(async () => await initDB() && await cleanup());

  describe('\'chat-room\'', () => {
    describe('getTotal', () => {
      it('runs without data', async () => {
        // make sure all is clean
        await cleanup();

        // make the request
        const res = await getRoomsTotal();

        assert.equal(res, 0);
      });

      it('runs', async () => {
        const user = await createUser(
          {
            name: rndKey(),
            email: `${rndKey()}@${rndKey()}.com`,
            surname: 'Last',
          },
        );
        await createChatRoom(
          {
            name: rndKey(),
            membersList: [{
              userId: user._id
            }],
            type: 'groups',
          },
        );

        // make the request
        const res = await getRoomsTotal();

        assert.ok(res > 0);
      });
    });

    describe('createChatRoom', () => {
      it('runs', async () => {
        // prepare test
        const user = await createUser(
          {
            name: rndKey(),
            email: `abc${rndKey()}+abc@abc${rndKey()}abc.com`
          },
        );

        // make the request
        const name = rndKey();
        const res = await createChatRoom(
          {
            name,
            membersList: [{
              userId: user._id
            }],
            type: 'groups',
          },
        );

        assert.ok(res);
        assert.ok(res._id);
        assert.equal(typeof res._id, 'string');
        assert.equal(res.name, name);
        assert.equal(res.membersList.length, 1);
      });

      it('runs and retrieves "old" if "oneonone" and duplicate', async () => {
        // prepare test
        const user = await createUser(
          {
            name: rndKey(),
            email: `abc${rndKey()}+abc@abc${rndKey()}abc.com`
          },
        );
        const user2 = await createUser(
          {
            name: rndKey(),
            email: `abc${rndKey()}+abc@abc${rndKey()}abc.com`
          },
        );
        const user3 = await createUser(
          {
            name: rndKey(),
            email: `abc${rndKey()}+abc@abc${rndKey()}abc.com`
          },
        );

        const name = rndKey();
        const room1 = await createChatRoom(
          {
            name,
            membersList: [
              { userId: user._id, },
              { userId: user2._id, }
            ],
            type: 'oneonone',
          },
        );
        // DEV: setting this room because even with the same name, we want the members
        //      to be exactly the same
        const room2 = await createChatRoom(
          {
            name,
            membersList: [
              { userId: user._id, },
              { userId: user3._id, },
            ],
            type: 'oneonone',
          },
        );

        // make the request
        const res = await createChatRoom(
          {
            name,
            membersList: [
              { userId: user._id, },
              { userId: user2._id, }
            ],
            type: 'oneonone',
          },
        );

        assert.ok(res);
        assert.ok(res._id);
        assert.equal(typeof res._id, 'string');
        assert.equal(res._id, room1._id);
        assert.notEqual(res._id, room2._id);
        assert.equal(res.name, name);
        assert.equal(res.membersList.length, 2);
      });
    });

    describe('getChatRoom', () => {
      it('should error without a valid id', async () => {
        // prepare test
        const user = await createUser(
          {
            name: rndKey(),
            email: `abc${rndKey()}+abc@abc${rndKey()}abc.com`
          },
        );
        await createChatRoom(
          {
            name: rndKey(),
            type: 'groups',
            membersList: [{ userId: user._id }]
          },
        );

        // make the request
        let res;
        let resErr;

        try {
          res = await getChatRoom(
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
        const room = await createChatRoom(
          {
            name: rndKey(),
            type: 'groups',
            membersList: [{ userId: user._id }]
          },
        );

        // make the request
        const res = await getChatRoom(room._id);

        assert.ok(res);
        assert.equal(res._id, room._id);
        assert.equal(typeof res._id, 'string');
        assert.equal(res.name, room.name);
        assert.ok(res.membersList);
        assert.equal(res.membersList.length, 1);
      });
    });

    describe('patchChatRoom', () => {
      it('should error without a valid id', async () => {
        // prepare test
        const user = await createUser(
          {
            name: rndKey(),
            email: `abc${rndKey()}+abc@abc${rndKey()}abc.com`
          },
        );
        await createChatRoom(
          {
            name: rndKey(),
            type: 'groups',
            membersList: [{ userId: user._id }]
          },
        );

        // make the request
        let res;
        let resErr;

        try {
          res = await patchChatRoom(
            rndKey(),
            {
              name: rndKey()
            },
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
        const room = await createChatRoom(
          {
            name: rndKey(),
            type: 'groups',
            membersList: [{ userId: user._id }]
          },
        );

        // make the request
        const secondName = rndKey();
        const res = await patchChatRoom(
          room._id,
          {
            name: secondName
          },
        );

        assert.ok(res);
        assert.equal(res._id, room._id);
        assert.equal(typeof res._id, 'string');
        assert.equal(res.name, secondName);
        assert.ok(res.membersList);
        assert.equal(res.membersList.length, 1);
      });
    });

    describe('delChatRoom', () => {
      it('should error without a valid id', async () => {
        // prepare test
        const user = await createUser(
          {
            name: rndKey(),
            email: `abc${rndKey()}+abc@abc${rndKey()}abc.com`
          },
        );
        await createChatRoom(
          {
            name: rndKey(),
            type: 'groups',
            membersList: [{ userId: user._id }]
          },
        );

        // make the request
        let res;
        let resErr;

        try {
          res = await delChatRoom(rndKey());
        } catch (err) {
          resErr = err;
        }

        // set tests
        assert.isNotOk(res);
        assert.ok(resErr);
        assert.equal(resErr.code, 400);
      });

      it('runs', async () => {
        // prepare test
        const user = await createUser(
          {
            name: rndKey(),
            email: `abc${rndKey()}+abc@abc${rndKey()}abc.com`
          },
        );
        const room = await createChatRoom(
          {
            name: rndKey(),
            type: 'groups',
            membersList: [{ userId: user._id }]
          },
        );

        // make the request
        await delChatRoom(room._id);

        // request the full document now
        try {
          const res = await getChatRoom(room._id);
          assert.isNotOk(res);
        } catch (err) {
          // DEV: all ok if it errored
        }

        // we shouldn't be able to retrieve any room messages
        try {
          const res = await getRoomMessages(room._id);
          assert.ok(res);
          assert.equal(res.length, 1);
        } catch (err) {
          // DEV: all ok if it errored
        }
      });
    });

    describe('getPerType', () => {
      it('runs without data', async () => {
        const user = await createUser(
          {
            name: rndKey(),
            email: `abc${rndKey()}+abc@abc${rndKey()}abc.com`
          },
        );

        // make the request
        const res = await getPerType('oneonone', user._id);
        assert.ok(res);
        assert.equal(res.length, 0);
      });

      it('runs', async () => {
        const user = await createUser(
          {
            name: rndKey(),
            email: `abc${rndKey()}+abc@abc${rndKey()}abc.com`
          },
        );
        const room = await createChatRoom(
          {
            name: rndKey(),
            type: 'groups',
            membersList: [{ userId: user._id }]
          },
        );
        await createChatRoom(
          {
            name: rndKey(),
            type: 'groups',
            membersList: []
          },
        );

        // make the request
        const res = await getPerType('groups', user._id);
        assert.ok(res);
        assert.equal(res.length, 1);

        // go per room
        const resRoom1 = res.filter(userRoom => room._id === userRoom._id)[0];
        assert.ok(resRoom1);
        assert.equal(resRoom1.name, room.name);
      });
    });
  });

  describe('\'chat-messages\'', () => {
    describe('getTotal', () => {
      it('runs without data', async () => {
        // make sure all is clean
        await cleanup();

        // make the request
        const res = await getMessagesTotal();

        assert.equal(res, 0);
      });

      it('runs', async () => {
        const user = await createUser(
          {
            name: rndKey(),
            email: `${rndKey()}@${rndKey()}.com`,
            surname: 'Last',
          },
        );
        const room = await createChatRoom(
          {
            name: rndKey(),
            membersList: [{
              userId: user._id
            }],
            type: 'groups',
          },
        );
        await createChatMessage(
          {
            authorId: user._id,
            message: rndKey(),
            roomId: room._id
          },
        );

        // make the request
        const res = await getMessagesTotal();

        assert.ok(res > 0);
      });
    });

    describe('createChatMessage', () => {
      it('should error without a valid room id', async () => {
        const user = await createUser(
          {
            name: rndKey(),
            email: `abc${rndKey()}+abc@abc${rndKey()}abc.com`
          },
        );
        await createChatRoom(
          {
            name: rndKey(),
            type: 'groups',
            membersList: [{ userId: user._id }]
          },
        );

        // make the request
        let res;
        let resErr;

        try {
          res = await createChatMessage(
            {
              authorId: user._id,
              message: rndKey(),
              roomId: rndKey(),
            },
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
        const room = await createChatRoom(
          {
            name: rndKey(),
            type: 'groups',
            membersList: [{ userId: user._id }]
          },
        );

        // make the request
        const message = rndKey();
        const res = await createChatMessage(
          {
            message,
            authorId: user._id,
            roomId: room._id,
          },
        );

        assert.ok(res);
        assert.ok(res._id);
        assert.equal(typeof res._id, 'string');
        assert.equal(res.message, message);
        assert.equal(res.roomId, room._id);
      });
    });

    describe('getChatMessage', () => {
      it('should error without a valid id', async () => {
        const user = await createUser(
          {
            name: rndKey(),
            email: `abc${rndKey()}+abc@abc${rndKey()}abc.com`
          },
        );
        const room = await createChatRoom(
          {
            name: rndKey(),
            type: 'groups',
            membersList: [{ userId: user._id }]
          },
        );
        await createChatMessage(
          {
            message: rndKey(),
            authorId: user._id,
            roomId: room._id,
          },
        );

        // make the request
        let res;
        let resErr;

        try {
          res = await getChatMessage(
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
        const room = await createChatRoom(
          {
            name: rndKey(),
            type: 'groups',
            membersList: [{ userId: user._id }]
          },
        );
        const message = await createChatMessage(
          {
            message: rndKey(),
            authorId: user._id,
            roomId: room._id,
          },
        );

        // make the request
        const res = await getChatMessage(message._id);

        assert.ok(res);
        assert.equal(res._id, message._id);
        assert.equal(typeof res._id, 'string');
        assert.equal(res.message, message.message);
        assert.equal(res.roomId, room._id);
      });
    });

    describe('getRoomMessages', () => {
      it('should error without a valid id', async () => {
        const user = await createUser(
          {
            name: rndKey(),
            email: `abc${rndKey()}+abc@abc${rndKey()}abc.com`
          },
        );
        await createChatRoom(
          {
            name: rndKey(),
            type: 'groups',
            membersList: [{ userId: user._id }]
          },
        );

        // make the request
        let res;
        let resErr;

        try {
          res = await getRoomMessages(rndKey());
        } catch (err) {
          resErr = err;
        }

        // set tests
        assert.isNotOk(res);
        assert.ok(resErr);
        assert.equal(resErr.code, 400);
      });

      it('runs without data', async () => {
        const user = await createUser(
          {
            name: rndKey(),
            email: `abc${rndKey()}+abc@abc${rndKey()}abc.com`
          },
        );
        const room = await createChatRoom(
          {
            name: rndKey(),
            type: 'groups',
            membersList: [{ userId: user._id }]
          },
        );

        // make the request
        const res = await getRoomMessages(room._id);

        assert.ok(res);
        assert.equal(res.length, 0);
      });

      it('runs', async () => {
        const user = await createUser(
          {
            name: rndKey(),
            email: `abc${rndKey()}+abc@abc${rndKey()}abc.com`
          },
        );
        const room = await createChatRoom(
          {
            name: rndKey(),
            type: 'groups',
            membersList: [{ userId: user._id }]
          },
        );
        const message = await createChatMessage(
          {
            authorId: user._id,
            message: rndKey(),
            roomId: room._id
          },
        );

        // make the request
        const res = await getRoomMessages(room._id);

        assert.ok(res);
        assert.equal(res.length, 1);
        assert.ok(res[0]);
        assert.equal(res[0].roomId, message.roomId);
        assert.equal(res[0].message, message.message);
      });
    });
  });
});
