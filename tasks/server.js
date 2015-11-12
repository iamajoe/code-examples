/*jshint node:true, es3:false, latedef:false*/
module.exports = function (grunt) {
    'use strict';

    var fs = require('fs'),
        path = require('path'),
        express   = require('express'),
        webFolder = path.resolve(path.join('../', 'build'));

    // Load all grunt tasks in node_modules
    grunt.file.expand('../node_modules/grunt-*/tasks').forEach(grunt.loadTasks);

    // The config
    grunt.initConfig({});

    // Create server
    grunt.registerTask('create_server', 'Creates server', function () {
        // Check if assets dir exists
        var site = express();
        var webIndex = path.join(webFolder, 'index.html');

        // Change cwd to the web folder
        process.chdir(webFolder);

        // Serve utf-8 by default
        site.use(function (req, res, next) {
            res.charset = 'utf-8';
            next();
        });

        // Serve index
        site.get('/', function (req, res) {
            return res.sendFile(webIndex);
        });

        // Serve files & folders
        site.get('/*', function (req, res) {
            // Get the requested file
            // If there are query parameters, remove them
            var file = path.resolve(path.join(webFolder, req.url.substr(1))).split('?')[0];

            checkFile(file, function (err, status) {
                if (status === 404) {
                    // Let the javascript framework handle the 404
                    res.sendFile(webIndex);
                } else if (status === 'file') {
                    // File is really a file
                    res.sendFile(file);
                } else {
                    // There was a status error
                    res.sendStatus(status);
                }
            });

        });

        /**
         * Check if file exists and what it is
         * @param  {*} file
         * @return {*}
         */
        function checkFile(file, cb) {
            fs.stat(file, function (err, stat) {
                // If file does not exists, serve 404 page
                if (err) {
                    return cb(null, err.code === 'ENOENT' && 404 || 500);
                }

                // If it exists and is a file, serve it
                if (stat.isFile()) {
                    return cb(null, 'file');
                }

                // Otherwise is a folder, so we deny the access
                return cb(null, 403);
            });
        }

        // Effectively listen
        site.listen(8000, 'localhost');
        console.log('Listening on http://localhost:8000');

        // Don't let the process die
        this.async();
    });

    grunt.registerTask('server', ['create_server']);
};
