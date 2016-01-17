'use strict';

import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import clone from 'mout/lang/clone.js';

// -----------------------------------------
// VARS

// -----------------------------------------
// FUNCTIONS

/**
 * Create store middleware
 */
let newStore = compose(
    applyMiddleware(thunk)
)(createStore);

/**
 * Updates views
 */
let updateViews = (self) => {
    let state = self.getState();

    // Update views with state
    self.views.forEach(view => view.update(state));
};

/**
 * Adds view to the store
 * @param  {tag} view
 */
let addView = (self, view) => {
    let state = self.getState();

    // Add the view future updates
    self.views.push(view);

    // Update the view with the actual state
    view.update(state);
};

/**
 * Removes view from the store
 * @param  {tag} view
 */
let removeView = (self, view) => {
    for (let i = 0; i < self.views.length; i += 1) {
        if (self.views[i] === view) {
            self.views.splice(i, 1);
            break;
        }
    }
};

/**
 * Create a reducer function
 * @param  {object} INITIAL_STATE
 * @param  {object} reducers
 * @return {function}
 */
let reducer = (INITIAL_STATE, reducers) => {
    return (state, action) => {
        state = state || clone(INITIAL_STATE);

        // Reset errors
        state.err = INITIAL_STATE.err;

        // Get the right reducer for the type
        let typeFn = reducers[action.type];

        return typeFn ? typeFn(state, action) : state;
    };
};

// -----------------------------------------
// INIT FUNCTION

/**
 * Initialize the store
 * @param  {object} INITIAL_STATE
 * @param  {object} reducers
 * @return {store} [description]
 */
var initStore = (INITIAL_STATE, reducers) => {
    // Finally create the store
    let store = newStore(reducer(INITIAL_STATE, reducers));
    store.views = []; // Used to update when store changes
    store.subscribe(updateViews.bind(null, store));

    // Export that will be used by actions
    return {
        dispatchAction: (action) => store.dispatch(action),
        addView: addView.bind(null, store),
        removeView: removeView.bind(null, store),
        getState: store.getState
    };
};

// -----------------------------------------
// EXPORT

export { initStore };
