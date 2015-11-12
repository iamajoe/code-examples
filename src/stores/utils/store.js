'use strict';
// import { devTools, persistState } from 'redux-devtools';
import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

// -----------------------------------------
// VARS

// -----------------------------------------
// PUBLIC FUNCTIONS

// -----------------------------------------
// PRIVATE FUNCTIONS

// -----------------------------------------
// EXPORT

export const finalCreateStore = compose(
  applyMiddleware(thunk)
)(createStore);
