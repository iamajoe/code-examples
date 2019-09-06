import * as Koa from 'koa';
import { getLogger } from '../core/logger';

// --------------------------------------------------
// variables

// --------------------------------------------------
// methods

/**
 * inits timer middleware
 */
export const init = () => async (ctx: Koa.Context, next: Function) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;

  getLogger().data(`- Request: ${ctx.request.method} ${ctx.request.url} - ${ms}ms`);
};
