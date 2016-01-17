'use strict';

import riot from 'riot';
import { initStore } from 'baseStore.js';
import postsActions from 'modules/posts/actions.js';

// -----------------------------------------
// VARS

const INITIAL_STATE = {
    defaultRoute: '/search/funny',
    routes: null,
    // TODO: Solve the base
    base: '#',
    err: null
};

// -----------------------------------------
// FUNCTIONS

/**
 * Initialize routing
 * @param  {object} state
 * @param  {object} action
 * @return {object}
 */
let init = (state, action) => {
    state.routes = action.routes;

    let routes = state.routes;
    let routesKeys = Object.keys(routes);
    let i;

    // Now lets set the routes
    for (i = 0; i < routesKeys.length; i += 1) {
        riot.route(routesKeys[i], routes[routesKeys[i]]);
    }

    // Start engines!
    riot.route.base(state.base);
    riot.route.start(true);

    return state;
};

/**
 * Set routing
 * @param  {object} state
 * @param  {object} action
 * @return {object}
 */
let setRoute = (state, action) => {
    riot.route(action.route);

    return state;
};

// -----------------------------------------
// ROUTES FUNCTIONS

/**
 * Home route handler
 * @param  {object} state
 * @param  {object} action
 * @return {object}
 */
let home = (state, action) => {
    // Force the change to other route
    setRoute(state, { route: INITIAL_STATE.defaultRoute });

    return state;
};

/**
 * Account route handler
 * @param  {object} state
 * @param  {object} action
 * @return {object}
 */
let search = (state, action) => {
    postsActions.changeQuery(action.query);

    return state;
};

// -----------------------------------------
// Initialize store

var store = initStore(INITIAL_STATE, {
    'INIT': init,
    'SET_ROUTE': setRoute,

    'HOME': home,
    'SEARCH': search
});

// -----------------------------------------
// EXPORT

store.setRoute = setRoute.bind(store, {});
export default store;
