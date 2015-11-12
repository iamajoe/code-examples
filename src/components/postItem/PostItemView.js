'use strict';
import deepMixIn from 'mout/object/deepMixIn';
import _ from 'underscore';
import View from 'Bedrock/View.js';
import tmpl from './assets/post_item.html';

// -----------------------------------------
// VARS

let viewConfig = {
    name: 'PostItemView',
    tagName: 'div',
    template: _.template(tmpl),
    className: 'post-item-view'
};

// Functions to be set later
let onClick;

// -----------------------------------------
// PUBLIC FUNCTIONS

/**
 * Render
 * @param  {*} self
 * @param  {object} data Object to be rendered
 */
let render = (self, data) => {
    View.prototype.render(self, data);

    // Set events
    self.$element.on('click', onClick.bind(self, self));
};

// -----------------------------------------
// PRIVATE FUNCTIONS

/**
 * Handles click on the post item view
 * @param  {*} self
 */
onClick = self => {
    // TODO: Set the click
};

// -----------------------------------------
// EXPORT

export default View.extend(deepMixIn(viewConfig, {
    render
}));
