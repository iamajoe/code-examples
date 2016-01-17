'use strict';

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
var onUpdateComp = (self, state) => {
    if (!state) { return; }

    // Create the data object
    self.data = mixIn({}, self.data, state);
};

// -----------------------------------------
// EXPORT

export { onUpdateComp };
