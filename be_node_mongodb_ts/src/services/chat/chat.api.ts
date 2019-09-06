import { enforceAuthUser } from 'toolbox-api/dist/helpers/enforceData';
import { getLogger } from '../../core/logger';
import {
  getRoomMessages,
  getTotal as getMessagesTotal,
} from './chat-messages.utils';
import {
  getTotal as getRoomsTotal,
  createChatRoom,
  getChatRoom,
  patchChatRoom,
  delChatRoom,
  enforceUserAccessToRoom,
  getPerType,
} from './chat-rooms.utils';

// -------------------------------------------------------------------------
// variables

// -------------------------------------------------------------------------
// methods

// init the service
export const service = {
  getRoomsTotal: async () => await getRoomsTotal(),
  createRoom: async (ctx) => {
    const body = (<any>ctx.request).body;

    enforceAuthUser({ state: ctx.state, logger: getLogger() });
    return await createChatRoom(body);
  },
  getRoom: async (ctx) => {
    const params = ctx.params;

    enforceAuthUser({ state: ctx.state, logger: getLogger() });
    enforceUserAccessToRoom(ctx.state.authUser._id, params.id);

    return await getChatRoom(params.id);
  },
  patchRoom: async (ctx) => {
    const params = ctx.params;
    const body = (<any>ctx.request).body;

    enforceAuthUser({ state: ctx.state, logger: getLogger() });
    enforceUserAccessToRoom(ctx.state.authUser._id, params.id);

    return await patchChatRoom(params.id, body);
  },
  delRoom: async (ctx) => {
    const params = ctx.params;

    enforceAuthUser({ state: ctx.state, logger: getLogger() });
    enforceUserAccessToRoom(ctx.state.authUser._id, params.id);

    return await delChatRoom(params.id);
  },

  getMessagesTotal: async () => await getMessagesTotal(),
  getRoomMessages: async (ctx) => {
    const params = ctx.params;
    const query = ctx.query;

    enforceAuthUser({ state: ctx.state, logger: getLogger() });
    enforceUserAccessToRoom(ctx.state.authUser._id, params.roomId);

    return await getRoomMessages(
      params.roomId,
      {
        limit: query.limit,
        skip: query.skip,
      }
    );
  },
  getUserRoomsOneOnOne: async (ctx) => {
    enforceAuthUser({ state: ctx.state, logger: getLogger() });
    return await getPerType('oneonone', ctx.state.authUser._id);
  },
  getUserRoomsGroups: async (ctx) => {
    enforceAuthUser({ state: ctx.state, logger: getLogger() });
    return await getPerType('groups', ctx.state.authUser._id);
  },
};
