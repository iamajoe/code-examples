import { createStore, combineReducers } from 'redux';

// -----------------------------------------
// VARS

const INITIAL_STATE = {
    query: null,
    posts: []
};

// -----------------------------------------
// FUNCTIONS

/**
 * Loading reducer
 * @param  {object}  state
 * @param  {object}  action
 * @return {object}
 */
const loading = (state = false, action) => {
    switch (action.type) {
    case 'UPDATE_POSTS_LOADING':
        return action.loading;
    default:
        return state;
    }
};

/**
 * Error reducer
 * @param  {object}  state
 * @param  {object}  action
 * @return {object}
 */
const err = (state = null, action) => {
    switch (action.type) {
    case 'UPDATE_POSTS_ERR':
        return action.err;
    default:
        return state;
    }
};

/**
 * Query reducer
 * @param  {object}  state
 * @param  {object}  action
 * @return {object}
 */
const query = (state = INITIAL_STATE.query, action) => {
    switch (action.type) {
    case 'CHANGE_QUERY':
        return action.query || state;
    default:
        return state;
    }
};

/**
 * Posts reducer
 * @param  {object}  state
 * @param  {object}  action
 * @return {object}
 */
const posts = (state = INITIAL_STATE.posts, action) => {
    switch (action.type) {
    case 'UPDATE_POSTS':
        const actionData = action.data && action.data.data.children;
        let hasThumbnail;
        let postsData;
        let thumb;
        let data;

        // Get the posts from data
        data = actionData.map(val => val.data) || [];

        // Get the data that interests us
        postsData = data.map((val = {}) => {
            thumb = val.thumbnail;
            hasThumbnail = !!thumb && thumb !== 'nsfw' && thumb !== 'self';

            return {
                permalink: val.permalink,
                thumbnail: hasThumbnail ? thumb : null,
                author: val.author,
                title: val.title,
                num_comments: val.num_comments,
                ups: val.ups,
                downs: val.downs
            };
        }).filter(val => !!val.permalink);

        // Finally set the data
        return postsData;
    default:
        return state;
    }
};

// -----------------------------------------
// Initialize

const reducers = combineReducers({ loading, err, query, posts });
const store = createStore(reducers);

// Register more methods
store.getInitial = () => INITIAL_STATE;

// -----------------------------------------
// EXPORT

export default store;
