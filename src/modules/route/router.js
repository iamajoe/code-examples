import { init, setRoute, updateOnAction } from 'baseRoute.js';
import appActions from 'modules/app/actions.js';
import rootRoutes from './modules/root.js';

// -----------------------------------------
// VARS

let allRoutes = [].concat(rootRoutes);

// -----------------------------------------
// INITIALIZE

// Wait for the store to initialize
init(allRoutes, appActions.getContent);

// Add to the update pool
let update = updateOnAction.bind(null, allRoutes);
appActions.addView({ update });

// -----------------------------------------
// EXPORT

export default setRoute.bind(null, allRoutes);
