import { addView, removeView } from 'baseActions.js';
import store from './store.js';

// -----------------------------------------
// VARS

// -----------------------------------------
// FUNCTIONS

/**
 * Sets content of app
 */
let setContent = (action) => {
    store.dispatchAction({ type: 'SET_CONTENT', content: action });
};

/**
 * Gets content of app
 */
let getContent = () => store.getState().content;

// -----------------------------------------
// EXPORT

export default {
    addView: addView.bind(null, store),
    removeView: removeView.bind(null, store),

    getContent, setContent
};
