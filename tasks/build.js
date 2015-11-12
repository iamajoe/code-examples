/*jshint node:true, es3:false, latedef:false*/
module.exports = function (grunt) {
    'use strict';

    var isProd = process.argv[1] === 'prod';
    var webpack = require('webpack');
    var fs = require('fs');
    var path = require('path');
    var mapping = require('../config/mapping.js');
    var rimraf = require('rimraf').sync;
    var oldConfig;

    // Load all grunt tasks in node_modules
    grunt.file.expand('../node_modules/grunt-*/tasks').forEach(grunt.loadTasks);

    // The config
    grunt.initConfig({
        webpack: {
            build: {
                // webpack options
                entry: '../src/bootstrap.js',
                output: {
                    path: '../build/',
                    filename: 'app.js'
                },
                // TODO: Source map not working as it should
                devtool: !isProd && 'source-map',
                stats: {
                    // Configure the console output
                    colors: true,
                    modules: true,
                    reasons: true
                },
                target: 'web',
                cache: isProd,
                watch: !isProd,
                debug: !isProd,
                resolve: {
                    modulesDirectories: ['./', 'node_modules', 'bower_components', 'src'],
                    alias: mapping
                },
                module: {
                    loaders: [{
                        test: /\.js?$/,
                        loader: 'babel',
                        query: !isProd && {
                            optional: ['runtime'],
                            stage: 0
                        }
                    }, {
                        test: /\.json?$/,
                        loader: 'json',
                        exclude: /(node_modules|bower_components)/
                    }, {
                        test: /\.html?$/,
                        loader: 'raw',
                        exclude: /(node_modules|bower_components)/
                    }]
                },
                plugins: isProd && [
                    new webpack.optimize.DedupePlugin()
                ]
            }
        },
        sass_globbing: {
            target: {
                files: {
                    '../build/app.scss': [
                        '../src/styles/main.scss',
                        '../src/components/**/*.scss',
                        '../src/components/**/*.sass',
                        '../src/components/**/*.css',
                        '../src/structure/**/*.scss',
                        '../src/structure/**/*.sass',
                        '../src/structure/**/*.css'
                    ]
                }
            }
        },
        sass: {
            target: {
                files: {
                    '../build/app.css': '../build/app.scss'
                }
            },
            options: {
                sourceMap: !isProd
            }
        },
        cssmin: {
            target: {
                files: {
                    '../build/app.css': ['../build/app.css']
                }
            }
        },
        uglify: {
            target: {
                files: {
                    '../build/app.js': ['../build/app.js']
                }
            }
        },
        copy: {
            main: {
                files: [
                    // includes files within path
                    { expand: true, cwd: '../src', src: ['./**/assets/!(scss|sass|css|tmpl)/**/*'], dest: '../build/src/' }
                ]
            }
        }
    });

    // Set app
    grunt.registerTask('set_app', 'Sets app', function () {
        // No need to go further if prod
        if (isProd) {
            return;
        }

        var dstPath = path.resolve('../build/src');
        var srcPath = path.resolve(path.join('../src'));

        try {
            fs.lstatSync(dstPath);
        } catch (err) {
            fs.symlinkSync(srcPath, dstPath);
        }
    });

    // Remove old files
    grunt.registerTask('remove_old_files', 'Remove old files', function () {
        if (fs.existsSync('../build/src')) {
            try {
                fs.unlinkSync('../build/src');
            } catch (err) {
                rimraf('../build/src');
            }
        }
        fs.existsSync('../build/app.css.map') && fs.unlinkSync('../build/app.css.map');
        fs.existsSync('../build/app.js.map') && fs.unlinkSync('../build/app.js.map');
        fs.existsSync('../build/app.css') && fs.unlinkSync('../build/app.css');
        fs.existsSync('../build/app.js') && fs.unlinkSync('../build/app.js');
    });

    // Force it to be prod in the config
    grunt.registerTask('force_config', 'Force config', function () {
        oldConfig = JSON.parse(fs.readFileSync('../config/config.json'));

        var keys = Object.keys(oldConfig);
        var newConfig = {};
        var i;

        // Copy the object
        for (i = 0; i < keys.length; i += 1) {
            newConfig[keys[i]] = oldConfig[keys[i]];
        }

        // Modify what should be different
        newConfig.env = isProd ? 'prod' : 'dev';

        // Save the file
        fs.writeFileSync('../config/config.json', JSON.stringify(newConfig, null, ''));
    });

    // Unforce config
    grunt.registerTask('unforce_config', 'Unforce config', function () {
        fs.writeFileSync('../config/config.json', JSON.stringify(oldConfig, null, 4));
    });

    // Clean temporaries done for the build
    grunt.registerTask('clean_build', 'Clean temporaries', function () {
        fs.existsSync('../build/app.scss') && fs.unlinkSync('../build/app.scss');
    });

    // The task...
    grunt.registerTask('build',
       isProd ? ['force_config', 'remove_old_files', 'webpack', 'sass_globbing', 'sass', 'cssmin', 'uglify', 'copy', 'unforce_config', 'clean_build']
       : ['force_config', 'remove_old_files', 'webpack', 'set_app', 'sass_globbing', 'sass', 'unforce_config', 'clean_build']
   );
};
