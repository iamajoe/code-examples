/* eslint-disable strict */
'use strict';
/* eslint-enable strict */

/* eslint-disable no-var */
var fs = require('fs-extra');
var path = require('path');
var Promise = require('bluebird');
var env = process.argv[2];
var rmPromise = Promise.promisify(fs.remove);

var cwd = process.cwd();
var tasksPath = 'bedrock/tasks';
var srcPath = path.join(cwd, 'src');
var buildPath = path.join(cwd, 'build');

var newPromise;
var bundlerFn;
var logTask;
var fileFn;
var cssFn;
/* eslint-enable no-var */

// Setup babel
require(path.join(tasksPath, 'utils/babel.js'));

/**
 * Log the task
 * @param  {string} task
 */
logTask = (task) => {
    let taskCmLine = '';

    // Lets create the comment line
    while (taskCmLine.length < 60) {
        taskCmLine += '#';
    }

    /* eslint-disable no-console */
    console.log(`\n${taskCmLine}\n# ${task} \n${taskCmLine}\n`);
    /* eslint-enable no-console */
};

/**
 * Sets a new promise
 * @return {promise}
 */
newPromise = () => (new Promise((resolve) => resolve()));

/**
 * File function
 * @return {promise}
 */
fileFn = () => {
    return newPromise()
    // Run file task
    .then(() => logTask('Run file tasks'))
    .then(() => {
        const fileTask = require(path.join(tasksPath, 'file.js'));
        const files = [
            {
                cwd: 'node_modules/bedrock/src',
                src: '**/_assets/**/*.*',
                ignore: ['**/*.scss', '**/*.css', '**/*.php', '**/*.html', '**/*.ico'],
                dest: buildPath
            }, {
                cwd: srcPath,
                src: '**/_assets/**/*.*',
                ignore: ['**/*.scss', '**/*.css', '**/*.php', '**/*.html', '**/*.ico'],
                dest: buildPath
            }, {
                cwd: path.join(srcPath, 'containers/_assets/html'),
                src: 'index.php',
                dest: buildPath
            }, {
                cwd: srcPath,
                src: 'favicon.ico',
                dest: buildPath
            }
        ];

        return fileTask(files, buildPath);
    });
};

/**
 * Css env function
 * @return {promise}
 */
cssFn = () => {
    return newPromise()
    // Remove old files
    .then(() => logTask('Remove old style files'))
    .then(() => rmPromise(path.join(buildPath, '*.css')))
    // Run style task
    .then(() => logTask('Run style tasks'))
    .then(() => {
        const fileTask = require(path.join(tasksPath, 'style.js'));
        const files = [{
            src: path.join(srcPath, 'components/_assets/css/main.scss'),
            dest: path.join(buildPath, 'app.css')
        }];

        return fileTask(files);
    });
};

/**
 * Bundler env function
 * @return {promise}
 */
bundlerFn = () => {
    return newPromise()
    // Remove old files
    .then(() => logTask('Remove old bundler files'))
    .then(() => rmPromise(path.join(buildPath, '*')))
    // Run bundler task
    .then(() => logTask('Run bundler tasks'))
    .then(() => {
        const fileTask = require(path.join(tasksPath, 'bundler.js'));
        const mappingPath = path.join(cwd, 'config/mapping.js');
        const files = [{
            entry: path.join(cwd, 'src', 'bootstrap.js'),
            output: {
                path: buildPath
            },
            resolve: {
                root: path.resolve(cwd),
                extensions: ['', '.js', '.jsx'],
                modulesDirectories: ['src', 'node_modules'],
                alias: fs.existsSync(mappingPath) && require(mappingPath)
            }
        }];

        return fileTask(files);
    })
    // Run style task
    .then(cssFn);
};

/**
* Take care of running the task
*/
newPromise()
// Set the tasks per env
.then(env === 'css' ? cssFn : bundlerFn)
// Take care of files
.then(env !== 'css' ? fileFn : () => {})
// Force to exit the process
.then(process.exit);
