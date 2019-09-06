import { getDB } from '../core/db';

// ---------------------------------------------
// variables

export interface IChatRoomCreate {
  name: string;
  type: 'oneonone'|'groups';
  membersList: {
    userId: string;
  }[];
  archived?: boolean;
}

export interface IChatRoomModel extends IChatRoomCreate {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------
// methods

export const init = () => {
  const db = getDB();
  if (db == null || db.mongoose == null) { return; }

  // maybe it is already there
  if (db.mongoose.models != null && db.mongoose.models['chat-rooms'] != null) {
    return db.mongoose.models['chat-rooms'];
  }

  // lets create the model
  const { ObjectId } = db.mongoose.Schema.Types;
  const schemaObj = {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'oneonone',
        'groups'
      ],
      required: true
    },
    membersList: [{
      userId: { type: ObjectId, ref: 'users', required: true },
      hideUntilNotification: { type: Boolean, default: false }
    }],
    archived: { type: Boolean, default: false }
  };

  const schema = new db.mongoose.Schema(schemaObj, { timestamps: true });
  const model = db.mongoose.model('chat-rooms', schema);

  // listen for possible issues
  model.on('index', (err) => { if (err != null) { console.error('model chat-rooms index err: ', err); } });

  // create indexes now
  model.createIndexes([
    { 'membersList.userId': 1 },
    { 'membersList.userId': 1, type: 1 },
  ])
  .then(() => model.syncIndexes())
  .catch(err => console.error('model chat-rooms index err: ', err));

  return model;
};
