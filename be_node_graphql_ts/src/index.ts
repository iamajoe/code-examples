import { Server, createServer } from 'http';
import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as cors from '@koa/cors';
import * as helmet from 'koa-helmet';
import * as graphqlHTTP from 'koa-graphql';
import schema from './schema';
import { parseTokenForUser } from './services/auth';

// --------------------------------
// variables

const PORT = process.env.PORT != null && process.env.PORT.length > 0 ? parseInt(process.env.PORT, 10) : 4000;
const ENV: string = process.env.PORT != null && process.env.PORT.length > 0 ? <string>process.env.NODE_ENV : 'development';
const IS_PROD_ENV = ENV === 'production' || ENV === 'prod';

export type IApp = {
  env: string;
  port: number;
  lib: Koa;
  server: Server|null;
};

// --------------------------------
// methods

/**
 * Retrieves the auth data from the request
 */
const authFromCtx = async (ctx) => {
  try {
    const authToken: string = ctx.headers.authorization;
    if (authToken == null || authToken.length === 0) { return {}; }

    return {
      authToken,
      authUser: await parseTokenForUser(authToken),
    };
  } catch (err) {
    // DEV: ignore error, we just don't need it
    return {};
  }
};

/**
 * Builds the context
 */
const buildContext = async (ctx, next: Function) => {
  ctx.state = { ...await authFromCtx(ctx) };

  await next();
};
/**
 * Closes the app
 */
export const close = async (app: IApp) => {
  if (app == null) { return; }

  if (app.server == null) { return; }
  app.server.close();
};

/**
 * initializes the api
 */
export const init = (options: {
  hideLogs?: boolean;
  dontCreateServer?: boolean;
} = {}): IApp => {
  // listen to errors on the process
  process.on('unhandledRejection', err => console.error(err));
  process.on('uncaughtException', err => console.error(err));

  // build the server
  const lib = new Koa();
  const router = new Router();

  // set general middlewares
  lib.use(cors());
  lib.use(helmet());
  lib.use(buildContext);

  // setup graphql
  router.all('/graphql', graphqlHTTP({
    schema,
    graphiql: !IS_PROD_ENV,
  }));

  // setup the routes on the app
  lib.use(router.routes()).use(router.allowedMethods());

  // setup the app
  const app = {
    lib,
    env: ENV,
    port: PORT,
    server: <null|Server>null
  };

  // finally listen to the port
  if (!options.dontCreateServer) {
    app.server = createServer(lib.callback());
    app.server.listen(PORT);

    if (!options.hideLogs) {
      console.log(`Server listening on ::${PORT} under "${ENV}" environment`);
    }
  }

  return app;
};
