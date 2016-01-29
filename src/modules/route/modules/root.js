import appActions from 'modules/app/actions.js';

// -----------------------------------------
// FUNCTIONS

/**
 * Index
 */
let index = {
    'type': 'INDEX',
    'url': '/',
    /**
     * Route handler
     * @param  {object} route
     * @param  {object} ctx
     * @param  {function} next
     */
    'onRoute': () => {
        appActions.setContent({
            type: 'SEARCH',
            params: {
                query: 'funny'
            }
        });
    }
};

/**
 * Search
 */
let search = {
    'type': 'SEARCH',
    'url': '/search/:query',
    /**
     * Url parsing
     * @param  {object} params
     * @return {string}
     */
    'urlParse': (params) => {
        return '/search/' + params.query;
    },
    /**
     * Route handler
     * @param  {object} route
     * @param  {object} ctx
     * @param  {function} next
     */
    'onRoute': (route, ctx) => {
        let params = ctx.params;
        let type = route.type;

        appActions.setContent({ type, params });
    }
};

// -----------------------------------------
// EXPORT

export default [index, search];
