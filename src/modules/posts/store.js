import { initStore } from 'baseStore.js';

// -----------------------------------------
// VARS

const INITIAL_STATE = {
    query: null,
    err: null,
    isLoading: false,
    posts: []
};

// -----------------------------------------
// FUNCTIONS

/**
 * Update posts type action
 * @param  {object}  state
 * @param  {object}  action
 * @return {object}
 */
let changeQuery = (state, action) => {
    let newState = state;

    newState.query = action.query || newState.query;

    // Reset state
    newState.isLoading = INITIAL_STATE.isLoading;

    return newState;
};

/**
 * Update posts type action
 * @param  {object}  state
 * @param  {object}  action
 * @return {object}
 */
let updatePosts = (state, action) => {
    let newState = state;
    let hasThumbnail;
    let posts;
    let thumb;

    // Maybe there was an error or is still loading
    if (!!action.err || !!action.isLoading) {
        newState.err = action.err;
        newState.isLoading = !!action.isLoading;
    }

    // Reset state
    newState.isLoading = INITIAL_STATE.isLoading;

    // Action needed!
    if (!action || !action.data) {
        return newState;
    }

    // Get the data that interests us
    posts = action.data.map((val = {}) => {
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
    newState.posts = posts;

    return newState;
};

// -----------------------------------------
// Initialize store

let store = initStore(INITIAL_STATE, {
    'CHANGE_QUERY': changeQuery,
    'UPDATE_POSTS': updatePosts
});

// -----------------------------------------
// EXPORT

export default store;
