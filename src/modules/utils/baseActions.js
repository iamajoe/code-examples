// -----------------------------------------
// VARS

// -----------------------------------------
// FUNCTIONS

/**
 * Adds view to the actions
 * @param  {store} store
 * @param  {tag} view
 */
let addView = (store, view) => store.addView(view);

/**
 * Removes view from the actions
 * @param  {store} store
 * @param  {tag} view
 */
let removeView = (store, view) => store.removeView(view);

// -----------------------------------------
// EXPORT

export { addView };
export { removeView };
