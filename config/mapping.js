const path = require('path');
const deepMixIn = require('mout/object/deepMixIn.js');
const bedrock = path.join(__dirname, '../node_modules/bedrock/config/mapping.js');

module.exports = deepMixIn(require(bedrock), {});
