import { combineReducers } from 'redux';

// -----------------------------------------
// VARS

const INITIAL_STATE = {
    content: {
        type: '',
        params: {
            query: 'funny'
        }
    }
};

// -----------------------------------------
// FUNCTIONS

/**
 * Content reducer
 * @param  {object}  state
 * @param  {object}  action
 * @return {object}
 */
const content = (state = INITIAL_STATE.content, action) => {
    switch (action.type) {
    case 'SET_CONTENT':
        return { ...action.content };
    default:
        return { ...state };
    }
};

// -----------------------------------------
// EXPORT

export default {
    getInitial: () => INITIAL_STATE,
    reducers: combineReducers({ content })
};
