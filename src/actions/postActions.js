'use strict';
import { getQuery, dispatchAction } from 'stores/postsStore.js';

// -----------------------------------------
// VARS

// -----------------------------------------
// PUBLIC FUNCTIONS

/**
 * Fetch all posts
 * @param  {string} query
 * @return {promise}
 */
let fetchAll = (query) => {
    // Maybe the query is the same already!
    if (getQuery() === query) {
        return;
    }

    // Change the query
    dispatchAction({ type: 'CHANGE_QUERY', query });

    // Set loading
    dispatchAction({ type: 'UPDATE_POSTS', isLoading: true });

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

    // Go on with the promise
    promise
    .then(fullData => {
        // Maybe a new query was done!
        if (getQuery() !== query) {
            return;
        }

        // Get the posts from data
        let data = fullData.data.children.map(val => val.data);

        // Finally resolve and dispatch
        dispatchAction({ type: 'UPDATE_POSTS', data });
    })
    .catch(err => {
        // Maybe a new query was done!
        if (getQuery() !== query) {
            return;
        }

        // Error!
        dispatchAction({ type: 'UPDATE_POSTS', err: err });
    });

    // Give the promise
    return promise;
};

// -----------------------------------------
// PRIVATE FUNCTIONS

// -----------------------------------------
// EXPORT

export { fetchAll };
