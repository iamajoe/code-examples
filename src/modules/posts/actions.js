import { request } from 'bedrock/actions';
import Promise from 'bluebird';

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
const changeQuery = (store, query) => {
    const state = store.getState();
    const stateQuery = state.posts.query;

    // Maybe the query is the same already!
    if (stateQuery === query) {
        return;
    }

    // Change the query
    store.dispatch({ type: 'CHANGE_POSTS_QUERY', query });

    // Go on with the promise
    request(store, fetchQuery.bind(null, query), 'UPDATE_POSTS');
};

// -----------------------------------------
// APP UPDATE FUNCTIONS

// -----------------------------------------
// EXPORT

export default (store) => {
    return {
        changeQuery: (action) => changeQuery(store, action)
    };
};
