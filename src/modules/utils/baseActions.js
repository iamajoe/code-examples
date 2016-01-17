'use strict';

// -----------------------------------------
// VARS

// -----------------------------------------
// FUNCTIONS

/**
 * Adds view to the actions
 * @param  {store} store
 * @param  {tag} view
 */
var addView = (store, view) => store.addView(view);

/**
 * Removes view from the actions
 * @param  {store} store
 * @param  {tag} view
 */
var removeView = (store, view) => store.removeView(view);

// -----------------------------------------
// EXPORT

export { addView };
export { removeView };
