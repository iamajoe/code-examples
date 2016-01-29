import Promise from 'bluebird';
import { addView, removeView } from 'baseActions.js';
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
let fetchQuery = (query) => {
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
let changeQuery = (query) => {
    let stateQuery = store.getState().query;
    let newQuery = query;

    // Maybe the query is the same already!
    if (newQuery && stateQuery === newQuery) {
        return;
    }

    // Get the default query
    newQuery = newQuery || store.getState().query;

    // Change the query
    store.dispatchAction({ type: 'CHANGE_QUERY', query: newQuery });

    // Set loading
    store.dispatchAction({ type: 'UPDATE_POSTS', isLoading: true });

    // Go on with the promise
    fetchQuery(newQuery)
    .then(fullData => {
        let data;

        stateQuery = store.getState().query;

        // Maybe a new query was done!
        if (stateQuery !== newQuery) {
            return;
        }

        // Get the posts from data
        data = fullData.data.children.map(val => val.data);

        // Finally resolve and dispatch
        store.dispatchAction({ type: 'UPDATE_POSTS', data });
    })
    .catch(err => {
        stateQuery = store.getState().query;

        // Maybe a new query was done!
        if (stateQuery !== newQuery) {
            return;
        }

        // Error!
        store.dispatchAction({ type: 'UPDATE_POSTS', err });
    });
};

// -----------------------------------------
// APP UPDATE FUNCTIONS

/**
 * Updates content from app
 * @param  {object} state
 */
let updateOnAction = (state) => {
    let content = state.content;

    if (!content.params || !content.params.query) {
        return state;
    }

    changeQuery(content.params.query);
};

// Add to the update pool
appActions.addView({ update: updateOnAction });

// -----------------------------------------
// EXPORT

export default {
    addView: addView.bind(null, store),
    removeView: removeView.bind(null, store),

    changeQuery
};
