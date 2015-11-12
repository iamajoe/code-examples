'use strict';
import config from './config.json';

let env = config.env || 'dev';
let configObj = config[env];

// Set the env
configObj.env = env;

export default configObj;
