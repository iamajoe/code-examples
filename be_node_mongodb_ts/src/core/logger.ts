import { init, ILogger } from 'toolbox-api/dist/logger';
import { getConfig } from './config';

// --------------------------------------------------
// variables

let logger: ILogger|null = null;

// --------------------------------------------------
// methods

// gets logger from the singleton
export const getLogger = () => {
  if (logger == null) {
    logger = init({
      hideLogs: getConfig().hideLogs,
      asyncMethods: {
        // error: getSaveErrorFn(app)
      }
    });
  }

  return logger;
};
