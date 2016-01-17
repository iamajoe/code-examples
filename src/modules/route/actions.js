'use strict';

import { addView, removeView } from 'baseActions.js';
import store from './store.js';

// -----------------------------------------
// VARS

const ROUTES = {
    '/': () => { store.dispatchAction({ type: 'HOME' }); },
    '/search/*': (query) => {
        store.dispatchAction({ type: 'SEARCH', query });
    }
};

// -----------------------------------------
// FUNCTIONS

/**
 * Set route
 */
var setRoute = (route) => {
    // The dispatch of init will set the routes
    store.dispatchAction({ type: 'SET_ROUTE', route });
};

/**
 * Init routing
 */
var init = () => {
    // The dispatch of init will set the routes
    store.dispatchAction({ type: 'INIT', routes: ROUTES });
};

// -----------------------------------------
// EXPORT

export default {
    addView: addView.bind(null, store),
    removeView: removeView.bind(null, store),

    init, setRoute
};
