import store from './store.js';
import appActionsFn from './app/actions.js';
import postsActionsFn from './posts/actions.js';

// -----------------------------------------
// VARS

const appActions = appActionsFn(store);
const postsActions = postsActionsFn(store);

// Add to the update pool
store.subscribe(() => {
    const state = store.getState();
    const content = state.app.content;
    const query = content.params && content.params.query;

    // Change the query
    query && postsActions.changeQuery(query);
});

// -----------------------------------------
// EXPORT

export default {
    subscribe: store.subscribe,
    getInitial: store.getInitial,
    getState: store.getState,

    ...appActions,
    ...postsActions
};
