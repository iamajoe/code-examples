'use strict';
import deepMixIn from 'mout/object/deepMixIn';
import _ from 'underscore';
import View from 'Bedrock/View.js';
import tmpl from './assets/app.html';

// -----------------------------------------
// VARS

let viewConfig = {
    name: 'AppView',
    tagName: 'div',
    template: _.template(tmpl),
    className: 'app-view'
};

// Functions to be set later
let onSubmit;

// -----------------------------------------
// PUBLIC FUNCTIONS

/**
 * Initialize
 * @return {appview}
 */
let initialize = function () {
    View.prototype.initialize.call(this);

    // Set keys to be bind with self
    this.bindToSelf(['getPosts', 'setSearch']);

    return this;
};

/**
 * Render
 * @param  {*} self
 * @param  {object} data Object to be rendered
 */
let render = (self, data) => {
    View.prototype.render(self, data);

    // Cache elements
    self.postsWrapperEl = self.$element.find('.posts-wrapper');
    self.searchInputEl = self.$element.find('.search-input');

    // Set events
    self.$element.find('form').on('submit', onSubmit.bind(self, self, false));
    self.searchInputEl.on('keypress', onSubmit.bind(self, self, true));
};

/**
 * Destroy
 * @param  {*} self
 * @param  {*} arg
 */
let destroy = (self, arg) => {
    // Clear timers
    self.throttler && clearTimeout(self.throttler);

    View.prototype.destroy(self, arg);
};

/**
 * Gets posts element
 * @param  {*} self
 * @return {jquery}
 */
let getPosts = self => self.postsWrapperEl;

/**
 * Sets search query
 * @param  {*} self
 * @param  {string} query
 */
let setSearch = (self, query) => self.searchInputEl.val(query);

// -----------------------------------------
// PRIVATE FUNCTIONS

/**
 * Search submit handler
 * @param  {*} self
 * @param  {isBoolean} isInput
 * @param  {event} evt
 */
onSubmit = (self, isInput, evt) => {
    // We don't want to actually submit the form
    !isInput && evt.preventDefault();

    // Throttler needed for better performance
    // and there is no need to constantly request
    self.throttler && clearTimeout(self.throttler);
    self.throttler = setTimeout(() => {
        let val = self.searchInputEl.val();

        // Tell the controller we need a search
        if (val.length > 2) {
            self.announce('search', {
                go: 'up',
                data: val
            });
        } else {
            // TODO: It should advise user
        }
    }, 500);
};

// -----------------------------------------
// EXPORT

export default View.extend(deepMixIn(viewConfig, {
    initialize, render, getPosts, setSearch, destroy
}));
