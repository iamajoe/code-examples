'use strict';
import riot from 'riot';
import { finalCreateStore } from './utils/store.js';

// -----------------------------------------
// VARS

let views, postsStore;

const types = {
    CHANGE_QUERY: 'CHANGE_QUERY',
    UPDATE_POSTS: 'UPDATE_POSTS'
};

// Functions that will be set later on
let changeQuery, updatePosts;

// -----------------------------------------
// PUBLIC FUNCTIONS

// -----------------------------------------
// PRIVATE FUNCTIONS

/**
 * Reducer method for the store
 * @param  {*} state
 * @param  {*} action
 * @return {*}
 */
let reducer = (state, action) => {
    // TODO: Jshint gives error if in arguments default
    state = state || {};

    // Go through each action type
    switch (action.type) {
        case types.CHANGE_QUERY:
            return changeQuery(state, action);
        case types.UPDATE_POSTS:
            return updatePosts(state, action);
        default:
            return state;
    }
};

/**
 * Subscribe for updates
 */
let subscribe = () => {
    let state = postsStore.getState();

    // Update views with state
    views.forEach(view => view.update(state));
};

/**
 * Adds view to the store
 * @param  {tag} view
 */
let addView = view => views.push(view);

/**
 * Removes view from the store
 * @param  {tag} view
 */
let removeView = view => {
    // TODO: Complete...
};

/**
 * Dispatchs actions
 * @param  {*} action
 */
let dispatchAction = action => {
    action.type = types[action.type];
    postsStore.dispatch(action);
};

/**
 * Gets query of store
 * @return {string}
 */
let getQuery = () => {
    return postsStore.getState().query;
};

// -----------------------------------------
// Type related

/**
 * Update posts type action
 * @param  {object}  state
 * @param  {object}  action
 * @return {object}
 */
changeQuery = (state, action) => {
    riot.route('/search/' + action.query);

    return {
        query: action.query,
        err: null,
        isLoading: false,
        posts: state.posts
    };
};

/**
 * Update posts type action
 * @param  {object}  state
 * @param  {object}  action
 * @return {object}
 */
updatePosts = (state, action) => {
    // Maybe there was an error or is still loading
    if (!!action.err || !!action.isLoading) {
        return {
            query: state.query,
            err: action.err,
            isLoading: !!action.isLoading,
            posts: state.posts
        };
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

    return {
        query: state.query,
        err: null,
        isLoading: false,
        posts
    };
};

// -----------------------------------------
// Initialize

views = [];
postsStore = finalCreateStore(reducer);
postsStore.subscribe(subscribe);

// -----------------------------------------
// EXPORT

export { getQuery };
export { dispatchAction };
export { addView };
export { removeView };
