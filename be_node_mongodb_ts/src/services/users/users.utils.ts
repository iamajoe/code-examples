import { randomBytes } from 'crypto';
import * as isEmail from 'validator/lib/isEmail';
import { hasher, comparePassword } from 'toolbox-api/dist/helpers/hasher';
import { addVerification as helperAddVerification, addResetToken as helperAddResetToken } from 'toolbox-api/dist/helpers/addVerification';
import { createToken } from 'toolbox-api/dist/helpers/authenticate';
import { handleMongoReq } from 'toolbox-api/dist/helpers/mongo';
import { enforceDataExists } from 'toolbox-api/dist/helpers/enforceData';
import { getConfig } from '../../core/config';
import { init as getUserModel, IUserModel, IUserCreate } from '../../models/users.model';
import { getDB } from 'src/core/db';

// -------------------------------------------------------------------------
// variables

// -------------------------------------------------------------------------
// private methods

// handles password require
const providePassword = (data: string|null|undefined): string => {
  if (data != null && data.length > 0) {
    return data;
  }

  // generate a new password
  return randomBytes(32).toString('hex');
};

// handles hash of the password
const hashPassword = (data: string): string => {
  return (data == null || data.length <= 0) ? data : hasher(data);
};

// -------------------------------------------------------------------------
// public methods

// gets user by email
export const getUserByEmail = async (email: string) => {
  enforceDataExists({ email }, ['email']);

  try {
    return await handleMongoReq<IUserModel>(() => getUserModel().findOne({ email: email.toLowerCase() })
    .lean().exec());
  } catch (err) {
    throw {
      code: 404,
      message: 'email was not found'
    };
  }
};

// gets set of users
export const getListOfUsersByEmail = async (emails: string[]) => {
  if (emails == null || emails.length <= 0) { return []; }

  return await handleMongoReq<IUserModel[]>(() => getUserModel().find({
    email: { $in: emails.map(email => email.toLowerCase()) }
  }).lean().exec());
};

// Logins user
export const login = async (email: string, password: string) => {
  enforceDataExists({ email, password }, ['email', 'password']);

  const config = getConfig();
  if (config.security.authentication == null || config.security.authentication.secret == null) {
    throw {
      code: 500,
      message: 'authentication secret not provided'
    };
  }

  const tokenSecret = config.security.authentication.secret;

  try {
    const userDocFullObject  = await handleMongoReq<IUserModel>(() => getUserModel().findOne(
      {
        email: `${email}`.toLowerCase()
      },
      '_id email password'
    ).lean().exec());

    const userDocObject = userDocFullObject != null ? { _id: userDocFullObject._id } : null;
    if (userDocObject == null) { throw new Error('wrong email'); }

    const isOk = comparePassword(`${password}`, userDocFullObject.password);
    if (!isOk) { throw new Error('wrong password'); }

    // create a token
    const token = createToken(tokenSecret, `${email}`.toLowerCase(), userDocObject._id);
    return { token, user: userDocObject };
  } catch (err) {
    if (err != null && err.message !== 'wrong email' && err.message !== 'wrong password' && err.code !== 404 && err.status !== 404) {
      throw err;
    }

    throw {
      code: 401,
      // DEV: we could set only the email at this point but we
      //      don't want to give the information that the email
      //      exists
      message: 'email or password isn\'t ok'
    };
  }
};

// verifies user
export const verifyUser = async (email: string, code: string) => {
  enforceDataExists({ email, code }, ['email', 'code']);

  try {
    await handleMongoReq<IUserModel>(() => getUserModel().findOneAndUpdate(
      {
        email: `${email}`.toLowerCase(),
        $or: [
          { verifyToken: `${code}` },
          { verifyShortToken: `${code}` }
        ]
      },
      {
        isVerified: true,
        // remove the tokens so that they can't be used again
        verifyExpires: null,
        verifyToken: null,
        verifyShortToken: null,
        verifyChanges: null,
      },
      {
        // select: '_id'
      }
    ).lean().exec());
  } catch (err) {
    if (err != null && err.message === 'resource doesn\'t exist') {
      throw {
        code: 400,
        message: 'email or code isn\'t what is expected'
      };
    }

    throw err;
  }

  return true;
};

// gets total of users
export const getTotal = async () => {
  return await getUserModel().estimatedDocumentCount({});
};

// check if the email is registered
export const isEmailRegistered = async (email: string) => {
  // being an email, we know it can't really have spaces so, must be a plus
  let parsedEmail = email != null ? `${email}` : '';
  parsedEmail = parsedEmail.replace(/ /g, '+').toLowerCase();

  try {
    const userExists = await getUserByEmail(parsedEmail);
    return (userExists != null && userExists.email === parsedEmail);
  } catch (err) {
    // DEV: it must not exist
    return false;
  }
};

// gets users
export const getUsers = async (ids: string[]) => {
  const userIds = (ids == null ? [] : ids).filter(id => id != null && id.length > 0);
  if (userIds.length === 0) { return []; }

  return await handleMongoReq<IUserModel[]>(() => getUserModel().find({
    _id: { $in: userIds }
  }).lean().exec());
};

// gets user
export const getUser = async (id: string) => {
  enforceDataExists({ id }, ['id']);

  const user = await getUsers([id]);
  const resData = user[0];
  if (resData == null) {
    throw {
      code: 400,
      message: 'resource doesn\'t exist'
    };
  }

  // discard was already handled in getUser
  return resData;
};

// patches user
export const patchUser = async (
  id: string,
  data: Partial<IUserCreate>,
  oldPassword: string|null = null
) => {
  enforceDataExists({ id }, ['id']);
  enforceDataExists(data);

  // force the email to be a string
  if (data.email != null) {
    data.email = `${data.email}`;
  }

  // force the password to be a string
  if (data.password != null) {
    data.password = `${data.password}`;
  }

  // check if the email is valid
  if (data.email != null && !isEmail(data.email)) {
    throw {
      code: 400,
      message: 'requirements are not fullfilled'
    };
  }

  // only non verified can patch without an user
  // DEV: we do it like this so we know that the data is always complete
  const Model = getUserModel();
  const oldUser = await handleMongoReq<IUserModel>(() => Model.findOne(
    { _id: id }
  ).lean().exec());

  // set before hooks
  const parsedData = data;

  // password needs to be handled if exists
  if (parsedData.password != null && parsedData.password.length > 0) {
    const testOldPassword = `${oldPassword}`;

    // being a new password on a patch, we need to ensure that the old password is the same
    if (oldPassword != null && testOldPassword.length > 0) {
      // at this point, we're sure that the user has a password
      const isOk = comparePassword(testOldPassword, oldUser.password);
      if (!isOk) {
        throw {
          code: 400,
          message: 'requirements are not fullfilled'
        };
      }

      // take care of the password
      // DEV: we already know it exists and it is the right type
      // DEV: we can do this because we're already enforcing the authUser to be the same id
      parsedData.password = hashPassword(`${parsedData.password}`);
    } else {
      // we always need an old password to patch the new one,
      // no need to error though, might be a bug of a password coming in
      delete parsedData.password;
    }
  }

  // make email always lowercase
  if (parsedData.email != null) {
    parsedData.email = parsedData.email.toLowerCase();
  }

  return await handleMongoReq<IUserModel>(() => Model.findOneAndUpdate({ _id: id }, parsedData, {
    new: true,
    runValidators: true,
    setDefaultsOnInsert: true,
    // select: '_id'
  }).lean().exec());
};

// sends an email to reset the password
export const sendResetPassword = async (email: string) => {
  enforceDataExists({ email }, ['email']);

  let user: IUserModel|null|undefined;

  try {
    user = await getUserByEmail(`${email}`.toLowerCase());
  } catch (err) {
    // DEV: nothing to do here...
  }

  // we need an user to go on
  if (user == null || user._id == null) {
    return false;
  }

  // time to update the user with the reset token in
  // we want to bypass this patch with bot
  const resetData = await helperAddResetToken();

  // data will be discarded on the way in so we can't use "patchUser"
  await handleMongoReq<IUserModel>(() => getUserModel().findOneAndUpdate({ _id: (<IUserModel>user)._id }, resetData, {
    new: true,
    runValidators: true,
    setDefaultsOnInsert: true,
    // select: '_id'
  }).lean().exec());

  return true;
};

// resets the user password
export const resetPassword = async (email: string, code: string, password: string) => {
  enforceDataExists({ email, code, password }, ['email', 'code', 'password']);

  try {
    const hashedPass = hashPassword(`${password}`);
    await handleMongoReq<IUserModel>(() => getUserModel().findOneAndUpdate(
      {
        email: `${email}`.toLowerCase(),
        $or: [
          { resetToken: `${code}` },
          { resetShortToken: `${code}` }
        ]
      },
      {
        // if user was able to receive the email with the right code,
        // he verified that he is the actual email user
        // so we make sure of that
        isVerified: true,
        verifyToken: null,
        verifyShortToken: null,
        verifyExpires: null,

        password: hashedPass,
        // remove the tokens so that they can't be used again
        resetToken: null,
        resetShortToken: null,
        resetExpires: null
      },
      {
        // select: '_id'
      }
    ).lean().exec());
  } catch (err) {
    throw {
      code: 400,
      // DEV: we could set only the email at this point but we
      //      don't want to give the information that the email
      //      exists
      message: 'email or code isn\'t ok'
    };
  }

  return true;
};

// sets the verification code
export const setAndSendVerifyCode = async (email: string) => {
  enforceDataExists({ email }, ['email']);

  let user: IUserModel|null|undefined;

  try {
    user = await getUserByEmail(`${email}`.toLowerCase());
  } catch (err) {
    // DEV: he must not exist
  }

  // maybe the user is already registered
  if (user == null || user._id == null || user.isVerified) { return false; }

  // time to update the user with the verification in
  // we want to bypass this patch with bot
  const verificationData = await helperAddVerification();

  // data will be discarded on the way in so we can't use "patchUser"
  const Model = getUserModel();
  await handleMongoReq<IUserModel>(() => Model.findOneAndUpdate(
    {
      _id: (<IUserModel>user)._id
    },
    verificationData,
    {
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
      // select: '_id'
    }
  ).lean().exec());

  return true;
};

// create user
export const createUser = async (data: IUserCreate) => {
  enforceDataExists(data, ['email']);

  // force the email to be a string
  data.email = `${data.email}`;

  // force the password to be a string
  if (data.password != null) {
    data.password = `${data.password}`;
  }

  // check if the email is valid
  if (!isEmail(data.email)) {
    throw {
      code: 400,
      message: 'requirements are not fullfilled'
    };
  }

  // check if exists and error if so
  if (await isEmailRegistered(data.email.toLowerCase())) {
    throw {
      code: 409,
      message: 'conflict'
    };
  }

  // set before hooks
  const parsedData = data;

  // take care of the password
  const hashedPassword = hashPassword(providePassword(data.password));

  (<any>parsedData).password = hashedPassword; // cache password

  // bot might want to setup verified straight from the bat
  if ((<any>data).isVerified) {
    (<any>parsedData).isVerified = (<any>data).isVerified;
  }

  // make email always lowercase
  parsedData.email = parsedData.email.toLowerCase();

  // save the model on the database
  const Model = getUserModel();
  const model = new Model(parsedData);
  const resData = await handleMongoReq<IUserModel>(() => model.save());

  // wait for the verification step to go forward
  await setAndSendVerifyCode(resData.email.toLowerCase());

  return resData;
};
