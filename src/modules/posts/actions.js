import { request } from 'bedrock/actions';
import Promise from 'bluebird';
import appActions from 'modules/app/actions.js';
import store from './store.js';

// -----------------------------------------
// VARS

// -----------------------------------------
// PRIVATE FUNCTIONS

/**
 * Fetches the query
 * @param  {string} query
 * @return {promise}
 */
const fetchQuery = (query) => {
    let promise;
    let xhr;

    // Just to get a promise
    promise = new Promise((resolve, reject) => {
        // Make the request
        xhr = new XMLHttpRequest();
        xhr.open('GET', encodeURI(`http://www.reddit.com/r/${query}/.json`));
        xhr.onload = () => {
            if (xhr.status !== 200) {
                reject({
                    code: 'BAD_REQUEST',
                    message: `Request failed. Returned status of ${xhr.status}`
                });
            }

            // Data came!
            resolve(JSON.parse(xhr.responseText));
        };

        xhr.send();
    });

    return promise;
};

// -----------------------------------------
// POST ACTIONS FUNCTIONS

/**
 * Change query of all posts
 * @param  {string} query
 */
const changeQuery = (query) => {
    const stateQuery = store.getState().query;
    let newQuery = query;

    // Maybe the query is the same already!
    if (newQuery && stateQuery === newQuery) {
        return;
    }

    // Get the default query
    newQuery = newQuery || store.getState().query;

    // Change the query
    store.dispatch({ type: 'CHANGE_QUERY', query: newQuery });

    // Go on with the promise
    request(store, fetchQuery.bind(null, newQuery), 'UPDATE_POSTS');
};

// -----------------------------------------
// APP UPDATE FUNCTIONS

// Add to the update pool
appActions.subscribe(() => {
    const state = appActions.getState();
    const content = state.content;

    if (!content.params || !content.params.query) {
        return state;
    }

    // Change the query
    changeQuery(content.params.query);
});

// -----------------------------------------
// EXPORT

export default {
    subscribe: store.subscribe,
    getInitial: store.getInitial,
    getState: store.getState,

    changeQuery
};
