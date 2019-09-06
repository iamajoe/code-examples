import { enforceAuthUser, enforceAuthUserSameId } from 'toolbox-api/dist/helpers/enforceData';
import { getLogger } from '../../core/logger';
import {
  login,
  verifyUser,
  createUser,
  getUser,
  patchUser,
  isEmailRegistered,
  setAndSendVerifyCode,
  sendResetPassword,
  resetPassword,
  getUserByEmail,
  getUsers
} from './users.utils';

// -------------------------------------------------------------------------
// variables

// -------------------------------------------------------------------------
// methods

// init the service
export const service = {
  login: async (ctx) => {
    const { email, password } = (<any>ctx.request).body;
    return await login(email, password);
  },
  verifyUser: async (ctx) => {
    const { email, code } = (<any>ctx.request).body;
    return await verifyUser(email, code);
  },
  resendVerifyCode: async (ctx) => {
    const { email } = (<any>ctx.request).body;
    return await setAndSendVerifyCode(email);
  },
  sendResetPassword: async (ctx) => {
    const { email } = (<any>ctx.request).body;
    return await sendResetPassword(email);
  },
  resetPassword: async (ctx) => {
    const { email, code, password } = (<any>ctx.request).body;
    return await resetPassword(email, code, password);
  },
  create: async (ctx) => {
    const body = (<any>ctx.request).body;
    return await createUser(body);
  },
  get: async (ctx) => {
    const params = ctx.params;

    enforceAuthUser({ state: ctx.state, logger: getLogger() });
    return await getUser(params.id);
  },
  getUsers: async (ctx) => {
    const body = (<any>ctx.request).body;

    enforceAuthUser({ state: ctx.state, logger: getLogger() });
    return await getUsers(body.ids);
  },
  patch: async (ctx) => {
    const params = ctx.params;
    const body = (<any>ctx.request).body;
    const query = ctx.query;

    enforceAuthUserSameId(params.id, { state: ctx.state, logger: getLogger() });
    return await patchUser(params.id, body, query.oldPassword);
  },
  getUserByEmail: async (ctx) => {
    const query = ctx.query;

    enforceAuthUser({ state: ctx.state, logger: getLogger() });
    return await getUserByEmail(query.email);
  },
  isEmailRegistered: async (ctx) => {
    const query = ctx.query;
    return await isEmailRegistered(query.email);
  },
};
