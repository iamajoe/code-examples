import { loadingReducer, errReducer } from 'bedrock/store';
import { combineReducers } from 'redux';

// -----------------------------------------
// VARS

const INITIAL_STATE = {
    query: null,
    list: []
};

// -----------------------------------------
// FUNCTIONS

/**
 * Query reducer
 * @param  {object}  state
 * @param  {object}  action
 * @return {object}
 */
const query = (state = INITIAL_STATE.query, action) => {
    switch (action.type) {
    case 'CHANGE_POSTS_QUERY':
        return action.query || state;
    default:
        return state;
    }
};

/**
 * List reducer
 * @param  {object}  state
 * @param  {object}  action
 * @return {object}
 */
const list = (state = INITIAL_STATE.list, action) => {
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
                id: val.id,
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
        return [...state];
    }
};

// -----------------------------------------
// EXPORT

export default {
    getInitial: () => INITIAL_STATE,
    reducers: combineReducers({
        loading: loadingReducer(false), err: errReducer(null),
        query, list
    })
};
