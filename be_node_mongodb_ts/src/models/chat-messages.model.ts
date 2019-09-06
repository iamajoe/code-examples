import { getDB } from '../core/db';

// ---------------------------------------------
// variables

export interface IChatMessageCreate {
  authorId: string;
  message: string;
  roomId: string;
}

export interface IChatMessageModel extends IChatMessageCreate {
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
  if (db.mongoose.models != null && db.mongoose.models['chat-messages'] != null) {
    return db.mongoose.models['chat-messages'];
  }

  // lets create the model
  const { ObjectId } = db.mongoose.Schema.Types;
  const schemaObj = {
    authorId: { type: ObjectId, ref: 'users', required: true },
    message: { type: String, required: true },
    roomId: { type: ObjectId, ref: 'chat-rooms', required: true }
  };

  const schema = new db.mongoose.Schema(schemaObj, { timestamps: true });
  const model = db.mongoose.model('chat-messages', schema);

  // listen for possible issues
  model.on('index', (err) => { if (err != null) { console.error('model chat-messages index err: ', err); } });

  // create indexes now
  model.createIndexes([
    { roomId: 1 },
    { roomId: 1, createdAt: -1 },
  ])
  .then(() => model.syncIndexes())
  .catch(err => console.error('model chat-messages index err: ', err));

  return model;
};
