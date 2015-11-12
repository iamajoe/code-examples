'use strict';
import deepMixIn from 'mout/object/deepMixIn';
import _ from 'underscore';
import View from 'Bedrock/View.js';
import tmpl from './assets/posts.html';

// -----------------------------------------
// VARS

let viewConfig = {
    name: 'PostsView',
    tagName: 'div',
    template: _.template(tmpl),
    className: 'posts-view'
};

// -----------------------------------------
// PUBLIC FUNCTIONS

/**
 * Initialize
 * @return {appview}
 */
let initialize = function () {
    View.prototype.initialize.call(this);

    // Set keys to be bind with self
    this.bindToSelf(['getElement', 'setLoading', 'unsetLoading']);

    return this;
};

/**
 * Gets view element
 * @param  {*} self
 * @return {jquery}
 */
let getElement = self => self.$element;

/**
 * Sets loading
 * @param  {*} self
 */
let setLoading = self => self.$element.addClass('is-loading');

/**
 * Unsets loading
 * @param  {*} self
 */
let unsetLoading = self => self.$element.removeClass('is-loading');

// -----------------------------------------
// PRIVATE FUNCTIONS

// -----------------------------------------
// EXPORT
viewConfig.initialize = initialize;

export default View.extend(deepMixIn(viewConfig, {
    initialize, getElement, setLoading, unsetLoading
}));
