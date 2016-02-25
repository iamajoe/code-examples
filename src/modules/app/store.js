import { initStore } from 'bedrock/store';
import deepMixIn from 'mout/object/deepMixIn.js';

// -----------------------------------------
// VARS

const INITIAL_STATE = {
    data: {
        content: {
            type: '',
            params: {
                query: 'funny'
            }
        }
    }
};

// -----------------------------------------
// FUNCTIONS

/**
 * Sets content
 * @param  {object}  state
 * @param  {object}  action
 * @return {object}
 */
const setContent = (state, action) => {
    const content = action.content;

    return deepMixIn({}, state, {
        data: { content }
    });
};

// -----------------------------------------
// EXPORT

export default initStore(INITIAL_STATE, {
    'SET_CONTENT': setContent
});
