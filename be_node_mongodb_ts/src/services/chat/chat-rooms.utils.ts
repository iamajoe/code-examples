import { handleMongoReq } from 'toolbox-api/dist/helpers/mongo';
import { enforceDataExists } from 'toolbox-api/dist/helpers/enforceData';
import { init as getChatRoomsModel, IChatRoomCreate, IChatRoomModel } from '../../models/chat-rooms.model';
import { delChatRoomMessages } from './chat-messages.utils';

// -------------------------------------------------------------------------
// variables

// -------------------------------------------------------------------------
// private methods

// -------------------------------------------------------------------------
// public methods

// gets total
export const getTotal = async () => {
  return await getChatRoomsModel().estimatedDocumentCount({});
};

// gets chat room per type
export const getPerType = async (
  type: ''|'oneonone'|'groups' = '',
  authUserId: string,
  includeArchive: boolean = false
) => {
  const query: { [key: string]: any } = { 'membersList.userId': authUserId };
  if (type != null && type !== '') { query.type = type; }
  if (!includeArchive) { query.archived = { $ne: true }; }

  return await handleMongoReq<IChatRoomModel[]>(() => getChatRoomsModel().find(query).lean().exec());
};

// gets room
export const getChatRoom = async (id: string) => {
  enforceDataExists({ id }, ['id']);

  return await handleMongoReq<IChatRoomModel>(() => getChatRoomsModel().findOne({ _id: id }).lean().exec());
};

// create room
export const createChatRoom = async (data: IChatRoomCreate) => {
  enforceDataExists(data);

  const Model = getChatRoomsModel();

  const parsedData = data;

  if (data.type === 'oneonone') {
    // we need 2 members for an oneonone
    if (data.membersList == null || data.membersList.length < 2) {
      throw {
        code: 400,
        message: 'requirements are not fullfilled'
      };
    }

    const user1 = data.membersList[0].userId;
    const user2 = data.membersList[1].userId;

    // we don't want to duplicate the room
    try {
      const oldRoom = await handleMongoReq<IChatRoomModel>(() => Model.findOne(
        {
          type: 'oneonone',
          $and: [
            { 'membersList.userId': user1 },
            { 'membersList.userId': user2 }
          ],
        },
        '_id'
      ).lean().exec());

      if (oldRoom != null && oldRoom._id != null && oldRoom._id.length > 0) {
        // we get the room so it passes through the general discards and so on
        return await getChatRoom(oldRoom._id);
      }
    } catch (err) {
      // DEV: nothing to do here, maybe it doesn't exist, it doesn't matter
    }
  }

  // save the model on the database
  const model = new Model(parsedData);
  return await handleMongoReq<IChatRoomModel>(() => model.save());
};

// checks if user has access to the room
export const enforceUserAccessToRoom = async (userId: string, roomId: string) => {
  if (userId == null || roomId == null) {
    throw {
      code: 401,
      message: 'not authorized'
    };
  }

  const room = await getChatRoom(roomId);

  // tslint:disable-next-line
  const isMember = room.membersList.filter(member => member.userId === userId).length > 0;
  if (isMember) { return; }

  throw {
    code: 401,
    message: 'not authorized'
  };
};

// patches room
export const patchChatRoom = async (
  id: string,
  data: Partial<IChatRoomCreate>,
) => {
  enforceDataExists({ id }, ['id']);
  enforceDataExists(data);

  const parsedData = data;

  // remove in case for some reason it came through
  delete (<any>parsedData).unreadCount;

  return await handleMongoReq<IChatRoomModel>(() => getChatRoomsModel().findOneAndUpdate({ _id: id }, parsedData, {
    new: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  }).lean().exec());
};

// deletes room
export const delChatRoom = async (id: string) => {
  enforceDataExists({ id }, ['id']);

  try {
    await getChatRoomsModel().deleteOne({ _id: id }).lean().exec();
    await delChatRoomMessages(id);
  } catch (err) {
    throw {
      code: 400,
      message: 'requirements not fullfilled'
    };
  }

  return true;
};
