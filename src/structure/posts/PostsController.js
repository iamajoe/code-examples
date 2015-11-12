'use strict';
import deepMixIn from 'mout/object/deepMixIn';
import Controller from 'Bedrock/Controller.js';
import PostsView from './PostsView.js';
import PostItemView from 'components/postItem/PostItemView.js';

// -----------------------------------------
// VARS
let controllerConfig = {
    name: 'PostsController'
};

// Functions to be set later on
let updatePosts, reqSearch, startPulling;

// -----------------------------------------
// PUBLIC FUNCTIONS

/**
 * Initialize
 * @param  {jquery} element Element where the View will render
 * @param  {string} category Category selected
 * @return {postscontroller}
 */
let initialize = function (element, category) {
    Controller.prototype.initialize.call(this);

    this.postsView = this.adopt(new PostsView());
    this.postsView.setElement(element);
    this.postsView.render();

    // Request the category
    reqSearch(this, category)
    .then(updatePosts.bind(null, this));

    return this;
};

/**
 * Destroy
 * @param  {*} self
 * @param  {*} arg
 */
let destroy = (self, arg) => {
    // Clear timers
    self.pulling && clearInterval(self.pulling);

    Controller.prototype.destroy(self, arg);
};

// -----------------------------------------
// PRIVATE FUNCTIONS

/**
 * Updates posts
 * @param  {*} self
 * @param  {string} posts
 */
updatePosts = (self, posts) => {
    // Create the array for the pulling verification
    self.postsViews = self.postsViews || [];

    // TODO: It should check if it is already there
    posts = JSON.parse(posts).data.children;
    posts.forEach(post => {
        let postItemView = self.adopt(new PostItemView());
        postItemView.setElement(self.postsView.getElement());
        postItemView.render(post.data);

        // Cache the posts views for later usage
        self.postsViews.push(postItemView);
    });
};

/**
 * Requests a search
 * @param  {*} self
 * @param  {string} query
 * @return {promise}
 */
reqSearch = (self, query) => {
    query = query || self.query;
    self.query = query;

    // Just to get a promise
    let promise = new Promise((resolve, reject) => {
        self.postsView.setLoading();

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
            resolve(xhr.responseText);
        };

        xhr.send();
    });

    // Go on with the promise
    promise
    .then(data => {
        self.postsView.unsetLoading();

        // Clear timers
        self.pulling && clearInterval(self.pulling);
        self.pulling = setInterval(startPulling.bind(self, self), 2000);

        return data;
    })
    .catch(err => {
        self.postsView.unsetLoading();

        self.announce('error', {
            go: 'up',
            data: err
        });
    });

    return promise;
};

/**
 * Starts pulling
 * @param  {*} self
 */
startPulling = (self) => {
    // TODO: Complete start pulling
};

// -----------------------------------------
// EXPORT

export default Controller.extend(deepMixIn(controllerConfig, {
    initialize, destroy
}));
