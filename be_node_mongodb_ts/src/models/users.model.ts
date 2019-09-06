import { getDB } from '../core/db';

// ---------------------------------------------
// variables

export interface IUserCreate {
  name?: string;
  surname?: string;
  email: string;
  password?: string;
  birthDate?: Date;
  gender?: string;
  mobile?: string;

  // General settings
  isDeleted?: boolean;
  hasInstalledApp?: boolean;
  language?: string;
}

export interface IUserModel extends IUserCreate {
  _id: string;
  createdAt: string;
  updatedAt: string;

  // Auth related
  passwordResetHash: string;
  isVerified: boolean;
  verifyToken: string;
  verifyShortToken: string;
  verifyExpires: Date;
  resetToken: string;
  resetShortToken: string;
  resetExpires: Date;
}

// ---------------------------------------------
// methods

export const init = () => {
  const db = getDB();
  if (db == null || db.mongoose == null) { return; }

  // maybe it is already there
  if (db.mongoose.models != null && db.mongoose.models.users != null) {
    return db.mongoose.models.users;
  }

  // lets create the model
  const schemaObj = {
    // General info
    name: { type: String, default: '' },
    surname: { type: String, default: '', },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, default: '', read: [] },
    birthDate: { type: Date, default: null },
    gender: { type: String, default: '' },
    mobile: { type: String, default: '' },

    // General settings
    isDeleted: { type: Boolean, default: false },
    hasInstalledApp: { type: Boolean, default: false },
    language: { type: String, default: 'en' },

    // Auth related
    passwordResetHash: { type: String, default: '', read: [] },
    isVerified: { type: Boolean, default: false },
    verifyToken: { type: String, },
    verifyShortToken: { type: String, },
    verifyExpires: { type: Date },
    resetToken: { type: String, },
    resetShortToken: { type: String, },
    resetExpires: { type: Date },
  };

  const schema = new db.mongoose.Schema(schemaObj, { timestamps: true });
  return db.mongoose.model('users', schema);
};
