import { getVersion } from 'toolbox-api/dist/helpers/version';

// -------------------------------------------------------------------------
// variables

// -------------------------------------------------------------------------
// methods

// init the service
export const service = {
  getStatus: async () => {
    return {
      build: getVersion(),
    };
  }
};
