import store from './store.js';

// -----------------------------------------
// VARS

// -----------------------------------------
// FUNCTIONS

/**
 * Sets content of app
 */
const setContent = (action) => {
    store.dispatch({ type: 'SET_CONTENT', content: action });
};

// -----------------------------------------
// EXPORT

export default {
    subscribe: store.subscribe,
    getInitial: store.getInitial,
    getState: store.getState,

    setContent
};
