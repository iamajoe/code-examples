import { init, setRoute, updateOnAction } from 'bedrock/router';
import appActions from 'modules/app/actions.js';
import rootRoutes from './modules/root.js';

// -----------------------------------------
// VARS

const allRoutes = [].concat(rootRoutes);

// -----------------------------------------
// INITIALIZE

// Wait for the store to initialize
init(allRoutes, (appActions.getState()).content);

// Add to the update pool
appActions.subscribe(() => {
    const state = appActions.getState();
    updateOnAction(allRoutes, state);
});

// -----------------------------------------
// EXPORT

export default (route) => setRoute(allRoutes, route);
