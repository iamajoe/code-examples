import { init, setRoute, updateOnAction } from 'bedrock/router';
import actions from '../modules/actions.js';
import rootRoutes from './modules/root.js';

// -----------------------------------------
// VARS

const content = actions.getState().app.content;
const allRoutes = [].concat(rootRoutes);

// -----------------------------------------
// INITIALIZE

// Wait for the store to initialize
init(allRoutes, content);

// Add to the update pool
actions.subscribe(() => {
    const state = actions.getState().app;
    updateOnAction(allRoutes, state);
});

// -----------------------------------------
// EXPORT

export default (route) => setRoute(allRoutes, route);
