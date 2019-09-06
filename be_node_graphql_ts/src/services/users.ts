import { IUser } from '../models/user';
import { createToken, comparePassword, hasher } from './auth';

// --------------------------------
// variables

// TODO: we should use a database for this
const users: IUser[] = [];

// --------------------------------
// methods

/**
 * Checks if a user name is registered
 * TODO: retrieve data from DB
 */
export const isUsernameRegistered = (username: string) => {
  if (username == null || username.length === 0) {
    throw {
      code: 400,
      message: 'requirements are not fullfilled'
    };
  }

  const user = users.filter(u => u.name === username)[0];
  return user != null;
};

/**
 * Get user retrieves an user by id
 * TODO: retrieve data from DB
 */
export const getUser = (id: string) => {
  if (id == null || id.length === 0) {
    throw {
      code: 400,
      message: 'requirements are not fullfilled'
    };
  }

  return users.filter(user => user.id === id)[0];
};

/**
 * Create user
 * TODO: create data on DB
 */
export const createUser = async (username: string, password: string) => {
  if (username == null || username.length === 0 || password == null || password.length === 0) {
    throw {
      code: 400,
      message: 'requirements are not fullfilled'
    };
  }

  // check if exists and error if so
  if (isUsernameRegistered(username)) {
    throw {
      code: 409,
      message: 'conflict'
    };
  }

  // TODO: this wouldn't be needed with a true database
  const id = `${users.length === 0 ? 1 : parseInt(users[users.length - 1].id, 10) + 1}`;
  const user = {
    id,
    // TOREAD: on the requirements states that the createUser and login were to retrieve "name"
    //         on my opinion it should be "username" but following the requirements so
    //         that the queries / mutations work right from the markdown file
    name: username,
    password: await hasher(password)
  };

  // cache the user
  users.push(user);

  return user;
};

/**
 * Logins user
 * TODO: retrieve data from DB
 */
export const login = async (username: string, password: string) => {
  if (username == null || username.length === 0 || password == null || password.length === 0) {
    throw {
      code: 400,
      message: 'requirements are not fullfilled'
    };
  }

  const user = users.filter(u => u.name === username)[0];

  try {
    if (user == null) { throw new Error('wrong username'); }

    const isOk = await comparePassword(`${password}`, user.password);
    if (!isOk) { throw new Error('wrong password'); }

    // create a token
    const token = createToken(user.id);
    return { token, user };
  } catch (err) {
    if (err != null && err.message !== 'wrong username' && err.message !== 'wrong password' && err.code !== 404 && err.status !== 404) {
      throw err;
    }

    throw {
      code: 401,
      // DEV: we could set only the username at this point but we
      //      don't want to give the information that the username
      //      exists
      message: 'username or password isn\'t ok'
    };
  }
};
