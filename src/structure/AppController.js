'use strict';
import deepMixIn from 'mout/object/deepMixIn';
import Controller from 'Bedrock/Controller.js';
import AppView from './AppView.js';
import PostsController from './posts/PostsController.js';

// -----------------------------------------
// VARS
let controllerConfig = {
    name: 'AppController'
};

let states = {
    'index': 'indexState',
    'search': 'searchState'
};

// -----------------------------------------
// PUBLIC FUNCTIONS

/**
 * Initialize
 * @param  {jquery} element Element where the View will render
 * @return {appcontroller}
 */
let initialize = function (element) {
    Controller.prototype.initialize.call(this);

    // Set keys to be bind with self
    this.bindToSelf(['indexState', 'searchState']);

    this.appView = this.adopt(new AppView());
    this.appView.setElement(element);
    this.appView.render();

    // Set search route
    this.on('search', query => {
        this.announce('bedrockrouter:navigate', {
            go: 'up', data: 'search/' + query
        });
    });

    // Catch errors
    this.on('error', err => {
        // TODO: We should advise user
        // TODO: Take better care of errors
    });

    return this;
};

// -----------------------------------------
// STATE FUNCTIONS

/**
 * Index state handler
 * @param {*} self
 * @param {object} state
 */
let indexState = (self, state) => {
    // Set the default route
    self.announce('bedrockrouter:navigate', {
        go: 'up',
        data: 'search/funny'
    });
};

/**
 * Search state handler
 * @param {*} self
 * @param {object} state
 */
let searchState = (self, state) => {
    // TODO: It should animate off and on
    if (self.postsController) {
        self.postsController.destroy();
    }

    // Set the posts controller
    let postsEl = self.appView.getPosts();
    self.postsController = self.adopt(new PostsController(postsEl, state.params.cat));

    // Set the search with the category
    self.appView.setSearch(state.params.cat);
};

// -----------------------------------------
// PRIVATE FUNCTIONS

// -----------------------------------------
// EXPORT

export default Controller.extend(deepMixIn(controllerConfig, {
    initialize, states,
    indexState, searchState
}));
