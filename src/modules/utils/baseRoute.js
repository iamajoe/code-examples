import page from 'page/page.js';

// -----------------------------------------
// PRIVATE FUNCTIONS

/**
 * Find route from type
 * @param  {object} state
 * @param  {object} action
 */
let findRoute = (routes, type) => {
    let route;
    let i;

    // Find the right route
    for (i = 0; i < routes.length; i += 1) {
        route = routes[i];
        route = (route.type === type) ? route : null;

        if (route) { break; }
    }

    return route;
};

// -----------------------------------------
// PUBLIC FUNCTIONS

/**
 * Update on action
 * @param  {object} state
 * @param  {object} action
 */
let updateOnAction = (routes, state) => {
    let urlParse;
    let params;
    let route;
    let url;

    if (!state || !state.content) { return; }

    route = findRoute(routes, state.content.type);
    if (!route) { return; }

    // Route to url
    urlParse = route.urlParse;
    params = state.content.params;
    url = !!urlParse ? urlParse(params) : route.url;

    // Navigate to the url
    if (url !== page.current) {
        page.show(url);
    }
};

/**
 * Sets routes
 * @param  {array} routes
 * @param  {string} base
 * @param  {string} type
 * @param  {object} params
 */
let setRoute = (routes, route) => {
    let routeFound = findRoute(routes, route.type);
    let urlParse;

    if (!routeFound) { return; }

    // Get the routeFound to url
    urlParse = routeFound.urlParse || function () {
        return routeFound.url;
    };

    return urlParse(route.params);
};

/**
 * Set routes
 * @param  {array} routes
 * @param  {string} base
 */
let init = (routes) => {
    let route;
    let fns;
    let i;
    let c;

    // Set all routes
    for (i = 0; i < routes.length; i += 1) {
        route = routes[i];
        fns = route.onRoute;

        // Force the array to exist
        fns = (typeof fns === 'function') ? [fns] : fns;

        // Go through each function
        for (c = 0; c < fns.length; c += 1) {
            // Setup the go route
            fns[c] = fns[c].bind(null, route);
        }

        // Finally set the route
        page(route.url, ...fns);
    }

    // Start engines!
    page.start();
};

// -----------------------------------------
// EXPORT

export { updateOnAction };
export { setRoute };
export { init };
