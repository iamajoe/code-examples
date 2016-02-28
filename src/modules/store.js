import { createStore, combineReducers } from 'redux';
import appStore from './app/store.js';
import postsStore from './posts/store.js';

// -----------------------------------------
// VARS

const INITIAL_STATE = {
    app: appStore.getInitial(),
    posts: postsStore.getInitial()
};

// -----------------------------------------
// Initialize

const reducers = combineReducers({
    app: appStore.reducers,
    posts: postsStore.reducers
});
const store = createStore(reducers);

// Register more methods
store.getInitial = () => INITIAL_STATE;

// -----------------------------------------
// EXPORT

export default store;
