import { createStore, combineReducers } from 'redux';

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
        return action.content;
    default:
        return state;
    }
};

// -----------------------------------------
// Initialize

const reducers = combineReducers({ content });
const store = createStore(reducers);

// Register more methods
store.getInitial = () => INITIAL_STATE;

// -----------------------------------------
// EXPORT

export default store;
