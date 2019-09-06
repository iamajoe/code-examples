import { Server } from 'http';
import * as socketIo from 'socket.io';
import { decodeToken } from 'toolbox-api/dist/helpers/authenticate';
import { handleErr, handleErrMsg } from 'toolbox-api/dist/helpers/errors';
import { enforceAuthUser, enforceDataExists } from 'toolbox-api/dist/helpers/enforceData';
import { sanitizeMsg } from 'toolbox-api/dist/helpers/string';
import { handleMongoReq } from 'toolbox-api/dist/helpers/mongo';
import { init as getChatMessagesModel, IChatMessageCreate, IChatMessageModel } from '../../models/chat-messages.model';
import { IQuery } from '../../helpers/interfaces';
import { getConfig } from '../../core/config';
import { getLogger } from '../../core/logger';
import {
  enforceUserAccessToRoom,
  getChatRoom,
  getPerType,
} from './chat-rooms.utils';

// -------------------------------------------------------------------------
// variables

// -------------------------------------------------------------------------
// methods

// gets parsed auth user
const getParsedAuthUser = (socket: socketIo.Socket): { _id: string; email: string; }|null => {
  let authUser = socket.handshake.query.tokenAuthUser;

  // the user is already there
  if (authUser != null) { return authUser; }

  // lets parse the token
  const token = socket.handshake.query.token;
  if (token == null || token.length <= 0) { return null; }

  try {
    const config = getConfig();

    if (config.security.authentication == null || config.security.authentication.secret == null) {
      throw {
        code: 500,
        message: 'authentication secret not provided'
      };
    }

    authUser = decodeToken(config.security.authentication.secret, token);
  } catch (err) {
    // do nothing... JWT might be malformed and in that case we don't need to do anything
  }

  // cache the user for later usage
  socket.handshake.query.tokenAuthUser = authUser;

  return authUser;
};

// gets socket clients with an user id
export const getSocketsWithUserId = async (io: socketIo.Server, userId: string) => {
  const socketRequest: Promise<string[]> = new Promise((resolve, reject) => {
    // retrieve the right ids to send the message to
    io.clients((err: any, socketClients: string[]) => {
      if (err) {
        // TODO: should we break something?
        resolve([]);
        return;
      }

      resolve(socketClients);
    });
  });

  // retrieve the sockets with the same toUserId
  const sockets = (await socketRequest)
  .filter((id) => {
    const socket = io.sockets.connected[id];

    // an id might not be present
    if (socket == null) { return false; }

    // check if the user id is what is the one we want
    const toUser = getParsedAuthUser(socket);
    return toUser != null && toUser._id === userId;
  });

  return sockets;
};

// saves chat message
export const createChatMessage = async (data: IChatMessageCreate) => {
  enforceDataExists(data);

  const parsedData = data;

  const Model = getChatMessagesModel();

  // save the model on the database
  const model = new Model(parsedData);
  return await handleMongoReq<IChatMessageModel>(() => model.save());
};

// gets chat message
export const getChatMessage = async (id: string) => {
  enforceDataExists({ id }, ['id']);

  return await handleMongoReq<IChatMessageModel>(() => getChatMessagesModel().findOne({ _id: id })
  .lean().exec());
};

// deletes chat room message
export const delChatRoomMessages = async (roomId: string) => {
  enforceDataExists({ roomId }, ['roomId']);

  try {
    await getChatMessagesModel().deleteMany({ roomId }).lean().exec();
  } catch (err) {
    throw {
      code: 400,
      message: 'requirements not fullfilled'
    };
  }

  return true;
};

// updates socket users of new room
const newRoomJoin = async (io: socketIo.Server, roomId: string) => {
  // retrieve room users
  const room = await getChatRoom(roomId);
  if (room == null) { return; }

  const memberIds = room.membersList.map(member => member.userId);

  const socketsPromises = Object.keys(io.sockets.sockets)
  .map(async (socketId) => {
    const socket = io.sockets.sockets[socketId];
    const socketAuthUserId = (<any>socket).authUser._id;

    // is the auth user under the userIds array?
    // tslint:disable-next-line
    const isMember = memberIds.filter(userId => userId === socketAuthUserId).length > 0;

    // types have their own way of dealing with room handling
    switch (room.type) {
    case 'groups':
    case 'oneonone':
    default:
      if (!isMember) { return null; }
    }

    // maybe already joined the room...
    const roomsIds = Object.keys(socket.rooms || []);
    const roomFound = roomsIds.filter(joinedRoomId => joinedRoomId === roomId).length > 0;
    if (roomFound) { return null; }

    // we need to inform him of the new room
    return socketId;
  });

  // resolve all sockets and check which are the ones to go forward
  const sockets = (await Promise.all(socketsPromises))
  .filter(socketId => socketId != null && socketId.length > 0)
  // DEV: at this point we've already filtered it out
  .map(socketId => io.sockets.sockets[socketId as string]);

  // iterate all sockets and inform of room update
  for (let i = 0; i < sockets.length; i += 1) {
    const socket = sockets[i];

    // make the socket join the new room
    socket.join(roomId);

    // emit the new room
    socket.emit('rooms:new', roomId);
  }
};

// handles one on one
const handleSendMessage = (socket: socketIo.Socket, io: socketIo.Server, authUserId: string) => {
  if (authUserId == null) { return; }

  // set the data we need
  socket.on('send:message', async (data, callbackFn) => {
    // so we can listen to the errors
    try {
      // do nothing with all the required data
      if (
        data == null ||
        data.message == null || data.message.length === 0 ||
        data.roomId == null || data.roomId.length === 0
      ) {
        return;
      }

      await enforceUserAccessToRoom(authUserId, data.roomId);

      const messageObj: IChatMessageCreate = {
        message: sanitizeMsg(`${data.message}`),
        authorId: authUserId,
        roomId: data.roomId,
      };

      // cache on the database
      const msgModel = await createChatMessage(messageObj);

      // callback if we can
      if (callbackFn != null) {
        callbackFn(msgModel);
      }

      // DEV: we want it on a different promise chain
      // send the new room update for those that haven't joined yet and force them to join
      newRoomJoin(io, data.roomId)
      .then(() => {
        // time to broadcast! send the message to the room
        socket.broadcast.to(data.roomId).emit('receive:message', msgModel);
      })
      .catch(err => getLogger().error(
        handleErr({ message: `chat: handleSendMessage: updateSocketUsers: ${handleErrMsg(err)}` })
      ));
    } catch (err) {
      getLogger().error(
        handleErr({ message: `chat: handleSendMessage: ${handleErrMsg(err)}` })
      );
    }
  });
};

// join available rooms for the user
const joinAvailableRooms = async (socket: socketIo.Socket, authUserId: string) => {
  if (authUserId == null) { return; }

  // retrieve rooms where user is in
  const rooms = await getPerType('', authUserId);
  const roomsIds = rooms.map(room => room._id);

  // join rooms with the same room id
  const p = new Promise((resolve, reject) => {
    socket.join(roomsIds, (err) => {
      if (err) { return reject(err); }
      resolve();
    });
  });

  return await p;
};

// sets the socket for the service
export const setChatSocket = (server: Server) => {
  // we need a server at this point
  if (server == null) { return; }

  const ioNamespace = '/chat/socket';
  const io = socketIo(server, { path: ioNamespace });

  // middleware the context and auth token
  io.use((socket, next) => {
    const authUser = getParsedAuthUser(socket);
    // DEV: <any> because it was already checked
    const authUserId: string|undefined = authUser == null ? undefined : (<any>authUser)._id;

    // we always an auth user
    try {
      enforceAuthUser({
        state: {
          isBot: false,
          authUser: authUserId == null ? undefined : { _id: authUserId },
        },
        logger: getLogger()
      });
      return next();
    } catch (err) {
      return next(err);
    }
  });

  // wait for connections
  io.on('connection', async (socket) => {
    // so we can listen to the errors
    try {
      const authUser = getParsedAuthUser(socket);
      // DEV: <any> because it was already checked
      const authUserId: string|undefined = authUser == null ? undefined : (<any>authUser)._id;

      // cache the authUser on the socket
      (<any>socket).authUser = authUser;

      // force to disconnect if no auth user was provided
      // it shouldn't reach here, it should error
      if (authUser == null || authUserId == null) {
        socket.disconnect();
        return;
      }

      // join available rooms for the user
      await joinAvailableRooms(socket, authUserId);

      // set the right connections
      handleSendMessage(socket, io, authUserId);
    } catch (err) {
      getLogger().error(
        handleErr({ message: `chat: setSocket: io on connection: ${handleErrMsg(err)}` })
      );
    }
  });

  return io;
};

// gets total of messages
export const getTotal = async () => {
  return await getChatMessagesModel().estimatedDocumentCount({});
};

// fetches room messages
export const getRoomMessages = async (roomId: string, query: Partial<IQuery> = {}) => {
  enforceDataExists({ roomId }, ['roomId']);

  if (roomId == null || roomId.length <= 0) { return []; }

  // handle defaults
  if (query.skip == null) { query.skip = 0; }
  if (query.limit == null || query.limit === 0) { query.limit = 100; }

  try {
    return await handleMongoReq<IChatMessageModel[]>(() => getChatMessagesModel().find(
      { roomId },
      null,
      {
        limit: 100,
        ...query,
        sort: { createdAt: -1 },
      }
    ).lean().exec());
  } catch (err) {
    throw {
      code: 400,
      message: 'requirements not fullfilled'
    };
  }
};
