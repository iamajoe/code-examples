import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as cors from '@koa/cors';
import * as helmet from 'koa-helmet';
import { Server, createServer } from 'http';
import { initErr as errMiddleware, init as responseMiddleware } from 'toolbox-api/dist/middleware/response';
import { init as requestMiddleware } from 'toolbox-api/dist/middleware/request';
import { init as authenticateMiddleware, parseAuthUser as parseAuthUserMiddleware } from 'toolbox-api/dist/middleware/authenticate';
import { init as isBotMiddleware } from 'toolbox-api/dist/middleware/isBot';
import { initNotAllowed as notAllowedMiddleware } from 'toolbox-api/dist/middleware/router';
import { setRouter } from 'toolbox-api/dist/router';
import { init as rateLimitMiddleware } from './middleware/rate-limit';
import { init as timerMiddleware } from './middleware/timer';

import { IConfig, getConfig } from './core/config';
import { closeDB, initDB } from './core/db';
import { getLogger } from './core/logger';
import { setChatSocket } from './services/chat/chat-messages.utils';
import { routes } from './routes';

// -------------------------------------------------------------------------
// variables

export interface IApp {
  lib?: Koa;
  server?: Server;
}

export interface IAppOptions {
  hideLogs: boolean;
  bypassConfig?: Partial<IConfig>;
}

// -------------------------------------------------------------------------
// methods

/**
 * Closes the app
 */
export const close = async (app: {
  server?: Server;
}|undefined|null) => {
  if (app == null) { return; }

  await closeDB();

  // close the server
  if (app.server != null) {
    return app.server.close();
  }
};

/**
 * initializes the api
 */
export const init = async (
  options: {
    hideLogs: boolean;
    disableServer?: boolean,
    disableLib?: boolean,
    bypassConfig?: Partial<IConfig>;
  } = { hideLogs: false }
): Promise<IApp> => {
  // set errors on the process
  // DEV: using console.error so we can override any possible issue with some lib
  process.on('unhandledRejection', err => console.error(err));
  process.on('uncaughtException', err => console.error(err));

  // set the basic app data
  const config = getConfig(options.bypassConfig);
  const logger = getLogger();
  const db = await initDB();

  // set the app
  const app: IApp = {
    lib: options.disableLib ? undefined : new Koa(),
    server: <Server|undefined>undefined
  };

  // set the server
  if (app.lib != null) {
    if (!options.disableServer) {
      // DEV: credentials can be set on the nginx on top
      // app.server = config.protocol === 'https' ? httpsCreateServer({}, app.lib.callback()) : createServer(app.lib.callback());
      app.server = createServer(app.lib.callback());
    }
  }

  // set app lib
  if (app.lib != null) {
    const context = <any>app.lib.context;
    context.config = config;
    context.logger = logger;
    context.db = db;

    // set middlewares
    app.lib.use(bodyParser({
      formLimit: '24mb',
      textLimit: '24mb',
      jsonLimit: '24mb'
    }));
    app.lib.use(requestMiddleware(true));
    app.lib.use(errMiddleware());
    app.lib.use(responseMiddleware());
    app.lib.use(rateLimitMiddleware());
    app.lib.use(helmet());
    if (config.security.authentication != null && config.security.authentication.secret != null) {
      app.lib.use(authenticateMiddleware(config.security.authentication.secret));
    }
    app.lib.use(parseAuthUserMiddleware());
    app.lib.use(cors());
    // TODO: when all implemented, change this
    //       we need to change the toolbox-api to accept
    //       other kind of config
    app.lib.use(isBotMiddleware(<any>config));
    app.lib.use(timerMiddleware());

    // handle routes
    const router = await setRouter(routes);
    app.lib.use(router.routes());
    app.lib.use(notAllowedMiddleware(router));
  }

  // run the server
  if (app.server != null) {
    setChatSocket(app.server);
    app.server.listen(config.port).on('error', logger.error);

    // set a simple log
    const url = config.builtHost;
    logger.info(`Server listening on ${url} with environment ${config.env}`);
  }

  return app;
};
