import { initStore } from 'bedrock/store';
import deepClone from 'mout/lang/deepClone.js';

// -----------------------------------------
// VARS

const INITIAL_STATE = {
    query: null,
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
const changeQuery = (state, action) => {
    const newState = deepClone(INITIAL_STATE);

    newState.query = action.query || newState.query;

    return newState;
};

/**
 * Update posts type action
 * @param  {object}  state
 * @param  {object}  action
 * @return {object}
 */
const updatePosts = (state, action) => {
    const newState = state;
    let hasThumbnail;
    let posts;
    let thumb;
    let data;

    // Action needed!
    if (!action || !action.data || !action.data.data) {
        return newState;
    }

    // Get the posts from data
    data = action.data.data.children.map(val => val.data);

    // Get the data that interests us
    posts = data.map((val = {}) => {
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
// EXPORT

export default initStore(INITIAL_STATE, {
    'CHANGE_QUERY': changeQuery,
    'UPDATE_POSTS': updatePosts
});
