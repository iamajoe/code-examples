'use strict';

import { initStore } from 'baseStore.js';
import routeStore from 'modules/route/store.js';

// -----------------------------------------
// VARS

const INITIAL_STATE = {
    query: 'funny',
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
    state.query = action.query || state.query;

    // Reset state
    state.isLoading = INITIAL_STATE.isLoading;

    // Set the route
    // Redux doesn't accept a dispatch at this point
    routeStore.setRoute({ route: '/search/' + state.query });

    return state;
};

/**
 * Update posts type action
 * @param  {object}  state
 * @param  {object}  action
 * @return {object}
 */
let updatePosts = (state, action) => {
    // Maybe there was an error or is still loading
    if (!!action.err || !!action.isLoading) {
        state.err = action.err;
        state.isLoading = !!action.isLoading;
    }

    // Reset state
    state.isLoading = INITIAL_STATE.isLoading;

    // Action needed!
    if (!action || !action.data) {
        return state;
    }

    // Get the data that interests us
    let posts = action.data.map((val = {}) => {
        let thumb = val.thumbnail;
        let hasThumbnail = !!thumb && thumb !== 'nsfw' && thumb !== 'self';

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
    state.posts = posts;

    return state;
};

// -----------------------------------------
// Initialize store

var store = initStore(INITIAL_STATE, {
    'CHANGE_QUERY': changeQuery,
    'UPDATE_POSTS': updatePosts
});

// -----------------------------------------
// EXPORT

export default store;
