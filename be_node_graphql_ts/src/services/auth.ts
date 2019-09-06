import * as jwt from 'jsonwebtoken';
import * as uniqid from 'uniqid';
import * as bcrypt from 'bcryptjs';

import { IUser } from '../models/user';
import { getUser } from './users';

// --------------------------------
// variables

const SECRET = process.env.SECRET != null && process.env.SECRET.length > 0 ? process.env.SECRET : uniqid();
const BCRYPT_WORK_FACTOR_BASE = 12;
const BCRYPT_DATE_BASE = 1483228800000;
const BCRYPT_WORK_INCREASE_INTERVAL = 47300000000;

// --------------------------------
// methods

/**
 * Hashes a password
 */
export const hasher = (password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const currentDate = new Date().getTime();
    const workIncrease = Math.max(0, Math.floor((currentDate - BCRYPT_DATE_BASE) / BCRYPT_WORK_INCREASE_INTERVAL));
    const workFactor = Math.min(19, BCRYPT_WORK_FACTOR_BASE + workIncrease);

    bcrypt.genSalt(workFactor, (err, salt) => {
      if (err) { return reject(err); }

      bcrypt.hash(password, salt, (errHash, hashedPassword) => {
        if (errHash) { return reject(errHash); }

        resolve(hashedPassword);
      });
    });
  });
};

/**
 * Compares password
 */
export const comparePassword = async (plainPassword: string, hashedPassword: string|null|undefined): Promise<boolean> => {
  const p: Promise<boolean> = new Promise((resolve, reject) => {
    // we need a password to check
    if (hashedPassword == null || hashedPassword.length === 0) {
      return resolve(false);
    }

    bcrypt.compare(plainPassword, hashedPassword, (err, res) => {
      // Handle 500 server error.
      if (err) {
        return reject(err);
      }

      return resolve(!!res);
    });
  });

  return await p;
};

/**
 * Creates token
 */
export const createToken = async (userId: string) => {
  const p: Promise<string> = new Promise((resolve, reject) => {
    jwt.sign({ userId }, SECRET, (err, decodedData) => {
      err ? reject(err) : resolve(decodedData);
    });
  });

  return await p;
};

/**
 * Gets verification of the token
 */
export const decodeToken = async (token: string) => {
  // sometimes people use "Bearer" so lets make sure that is out
  const tokenSplit = token.split(' ');
  const tokenToBe = tokenSplit[tokenSplit.length - 1];

  const p: Promise<{ userId: string }> = new Promise((resolve, reject) => {
    jwt.verify(tokenToBe, SECRET, (err, decodedData) => {
      err ? reject(err) : resolve(decodedData);
    });
  });

  return await p;
};

/**
 * Parses the token into a valid user
 */
export const parseTokenForUser = async (token: string): Promise<IUser|null> => {
  try {
    const tokenData = await decodeToken(token);
    return await getUser(tokenData.userId);
  } catch (err) {
    // DEV: any error should simply just return null
    return null;
  }
};
