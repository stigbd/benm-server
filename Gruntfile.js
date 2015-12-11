module.exports = function(grunt) {
    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // bower
        bower: {
            install: {
                options: {
                    targetDir: 'client/requires',
                    layout: 'byComponent'
                }
            }
        },

        // clean
        clean: {
            build: ['build'],
            dev: {
                src: ['build/app.js', 'build/<%= pkg.name%>.css', 'build/<%= pkg.name %>.js']
            },
            prod: ['dist']
        },

        // browserify
        browserify: {
            vendor: {
                src: ['client/requires/**/*.js'],
                dest: 'build/vendor.js',
                options: {
                    shim: {
                        jquery: {
                            path: 'client/requires/jquery/js/jquery.js',
                            exports: '$'
                        },
                        underscore: {
                            path: 'client/requires/underscore/js/underscore.js',
                            exports: '_'
                        },
                        backbone: {
                            path: 'client/requires/backbone/js/backbone.js',
                            exports: 'Backbone',
                            depends: {
                                underscore: 'underscore'
                            }
                        },
                        'backbone.marionette': {
                            path: 'client/requires/backbone.marionette/js/backbone.marionette.js',
                            exports: 'Marionette',
                            depends: {
                                jquery: '$',
                                backbone: 'Backbone',
                                underscore: '_'
                            }
                        }
                    }
                }
            },
            app: {
                files: {
                    'build/app.js': ['client/src/main.js']
                },
                options: {
                    transform: ['hbsfy'],
                    external: ['jquery', 'underscore', 'backbone', 'backbone.marionette']
                }
            },
            test: {
                files: {
                    'build/tests.js': [
                        'client/spec/**.*.test.js'
                    ]
                },
                options: {
                    transform: ['hbsfy'],
                    external: ['jquery', 'underscore', 'backbone', 'backbone.marionette']
                }
            }
        },

        // LESS
        // Transpile any .less files to .css and put the .css file in the build
        // directory named 'myapp'.css
        less: {
            transpile: {
                files: {
                    'build/<%= pkg.name %>.css' : [
                        'client/styles/reset.css',
                        'client/requires/*/css/*',
                        'client/styles/less/main.less'
                    ]
                }
            }
        },

        // Concat
        // Concatenate all of the .js files into a single file.
        concat: {
            'build/<%= pkg.name %>.js' : ['build/vendor.js', 'build/app.js']
        },

        // Copy
        // In dev mode, copy the files from the build directory to
        // the destination that they must reside so that our front-end app
        // can see them and our server can serve them.
        copy: {
            dev: {
                files: [{
                    src: 'build/<%= pkg.name %>.js',
                    dest: 'public/js/<%= pkg.name %>.js'

                }, {
                    src: 'build/<%= pkg.name %>.css',
                    dest: 'public/css/<%= pkg.name%.css>'
                }, {
                    src: 'client/img/*',
                    dest: 'public/img/'
                }]
            },
            prod: {
                files: [{
                    src: ['client/img/*'],
                    dest: 'dist/img/'
                }]
            }
        },

        // cssmin
        cssmin: {

        },

        // uglify
        uglify: {

        },

        // watch
        // Watch all files for any time they get modified. When the do change,
        // execute pre-existing Grunt tasks already defined.
        watch: {
            scripts: {
                files: ['client/templates/*.hbs', 'client/src/**/*.js'],
                tasks: ['clean:dev', 'browserify:app', 'concat', 'copy:dev']
            },
            less: {
                files: ['client/styles/**/*.less'],
                tasks: ['less:transpile', 'copy:dev']
            },
            test: {
                files: ['build/app.js', 'client/spec/**/*.test.js'],
                tasks: ['browserify:test']
            },
            karma: {
                files: ['build/tests.js'],
                tasks: ['jshint:test', 'karma:watcher:run']
            }
        },

        // nodemon
        // The same as watch, except for the server related .js files
        // Whenever a node.js file is changed on the server, restart
        // the server so the latest versjion is running
        nodemon: {
            dev: {
                options: {
                    file: 'server.js',
                    nodeArgs: ['--debug'],
                    whatchedFolders: ['controllers', 'app'],
                    env: {
                        PORT: '3300'
                    }
                }
            }
        },

        // shell
        // A simple command line excecution. Launch the mongod server:
        shell: {
            mongodb: {
                command: 'mongod',
                options: {
                    async: true
                }
            }
        },

        // concurrent
        // Ensure that we can execute a number of "blocking" tasks
        // asynchronously at the same time
        concurrent: {
            dev: {
                tasks: ['nodemon:dev', 'shell:mongodb', 'watch:scripts',
                'watch:less', 'watch:test'],
                options: {
                    logConcurrentOutput: true
                }
            },
            test: {
                tasks: ['watch:karma'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },

        //karma
        karma: {

        },

        // jsHint
        // Run jsHint syntax checking on all necessary .js files
        jshint: {
            all: ['Gruntfile.js', 'client/src/**/*.js', 'client/spec/**/*.js'],
            dev: ['client/src/**/*.js'],
            test: ['client/spec(/**/*.js)']
        }
    });

    // register tasks
    // init:dev
    grunt.registerTask('init:dev', ['clean', 'bower', 'browserify:vendor']);
    // build:dev
    grunt.registerTask('build:dev', ['clean:dev', 'browserify:app',
    'browserify:test', 'jshint:dev', 'less:transpile', 'concat', 'copy:dev']);
    // build:prod
    grunt.registerTask('build:prod', ['clean:dev', 'browserify:app',
    'browserify:test', 'jshint:dev', 'less:transpile', 'concat', 'copy:dev']);
    // server
    grunt.registerTask('server', ['build:dev', 'concurrent:dev']);
    // test:client
    grunt.registerTask('test:client', ['karma:test']);
    // tdd
    grunt.registerTask('tdd', ['karma:watcher:start', 'concurrent:test']);
};
