'use strict';

import Promise from 'bluebird';
import { addView, removeView } from 'baseActions.js';
import store from './store.js';

// -----------------------------------------
// VARS

// -----------------------------------------
// FUNCTIONS

/**
 * Fetches the query
 * @param  {string} query
 * @return {promise}
 */
let fetchQuery = (query) => {
    // Just to get a promise
    let promise = new Promise((resolve, reject) => {
        // Make the request
        let xhr = new XMLHttpRequest();
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

/**
 * Change query of all posts
 * @param  {string} query
 */
var changeQuery = (query) => {
    // Maybe the query is the same already!
    if (store.getState().query === query) {
        return;
    }

    // Get the default query
    query = query || store.getState().query;

    // Change the query
    store.dispatchAction({ type: 'CHANGE_QUERY', query });

    // Set loading
    store.dispatchAction({ type: 'UPDATE_POSTS', isLoading: true });

    // Go on with the promise
    fetchQuery(query)
    .then(fullData => {
        // Maybe a new query was done!
        if (store.getState().query !== query) {
            return;
        }

        // Get the posts from data
        let data = fullData.data.children.map(val => val.data);

        // Finally resolve and dispatch
        store.dispatchAction({ type: 'UPDATE_POSTS', data });
    })
    .catch(err => {
        // Maybe a new query was done!
        if (store.getState().query !== query) {
            return;
        }

        // Error!
        store.dispatchAction({ type: 'UPDATE_POSTS', err: err });
    });
};

// -----------------------------------------
// EXPORT

export default {
    addView: addView.bind(null, store),
    removeView: removeView.bind(null, store),

    changeQuery
};
