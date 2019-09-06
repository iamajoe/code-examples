import * as Koa from 'koa';
import { RateLimit } from 'koa2-ratelimit';
import { getConfig } from '../core/config';

// --------------------------------------------------
// variables

// --------------------------------------------------
// methods

/**
 * build the rate limit middleware
 */
export const init = () => {
  const config = {
    ...getConfig().security.rateLimit,
    getUserId: async (ctx: Koa.Context) => {
      const user = ctx.state.authUser;

      if (user == null) { return null; }
      return user.userId != null ? user.userId : user._id;
    }
  };

  return RateLimit.middleware(config);
};
