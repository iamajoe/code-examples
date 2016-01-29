import mixIn from 'mout/object/mixIn.js';

// -----------------------------------------
// VARS

// -----------------------------------------
// FUNCTIONS

/**
 * Adds view to the actions
 * @param  {store} store
 * @param  {tag} view
 */
let onUpdateComp = (self, state) => {
    if (!state) { return; }

    // Create the data object
    /* eslint-disable no-param-reassign */
    self.data = mixIn({}, self.data, state);
    /* eslint-enable no-param-reassign*/
};

// -----------------------------------------
// EXPORT

export { onUpdateComp };
