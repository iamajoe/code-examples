import { getLogger } from '../core/logger';

// --------------------------------------------------
// methods

// builds toolbox state to send in the utils
export const buildToolboxState = (
  authUserId: string|undefined|null = '',
  isBot: boolean|undefined|null = false
) => {
  return {
    state: {
      isBot,
      authUser: {
        _id: authUserId
      }
    },
    logger: getLogger()
  };
};
