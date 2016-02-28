// -----------------------------------------
// VARS

// -----------------------------------------
// FUNCTIONS

/**
 * Sets content of app
 */
const setContent = (store, action) => {
    store.dispatch({ type: 'SET_CONTENT', content: action });
};

// -----------------------------------------
// EXPORT

export default (store) => {
    return {
        setContent: (action) => setContent(store, action)
    };
};
