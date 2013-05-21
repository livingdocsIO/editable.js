'use strict';

// livereload
var path = require('path');
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var folderMount = function folderMount(connect, point) {
  return connect.static(path.resolve(point));
};

module.exports = function (grunt) {

  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);


  grunt.initConfig({
    livereload: {
      port: 35729 // Default livereload listening port.
    },
    watch: {
      livereload: {
        files: [
          '*.html',
          '.tmp/{,*/}*.js',
          'test/js/{,*/}*.js',
          'test/css/{,*/}*.css'
        ],
        tasks: ['livereload']
      },
      src: {
        files: [
          'src/{,*/}*.js',
          'spec/**/*.spec.js'
        ],
        tasks: ['concat:editable']
      }
    },
    connect: {
      livereload: {
        options: {
          port: 9000,
          hostname: '0.0.0.0',
          // Change this to '0.0.0.0' to access the server from outside.
          middleware: function(connect, options) {
            return [lrSnippet, folderMount(connect, options.base)];
          }
        }
      },
      test: {
        options: {
          port: 9001,
          hostname: '0.0.0.0',
          middleware: function (connect, options) {
            return [
              folderMount(connect, options.base)
            ];
          }
        }
      }
    },
    open: {
      server: {
        url: 'http://localhost:<%= connect.livereload.options.port %>'
      }
    },
    clean: {
      dist: ['.tmp', 'dist'],
      server: '.tmp'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'src/{,*/}*.js'
      ]
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        browsers: ['PhantomJS']
      },
      browsers: {
        configFile: 'karma.conf.js',
        browsers: ['Chrome', 'Firefox', 'Safari', 'Opera']
      },
      build: {
        configFile: 'karma.conf.js',
        browsers: ['Chrome', 'Firefox', 'Safari', 'Opera'],
        singleRun: true
      }
    },
    concat: {
      dist: {
        files: {
          'dist/editable.js': [
            'vendor/rangy-1.2.3/rangy-core.js',
            'vendor/bowser.js',
            '.tmp/editable.js'
          ]
        }
      },
      editable: {
        files: {
          '.tmp/editable.js': [
            'editable.prefix',
            'src/util/*.js',
            'src/core.js',
            'src/!(core).js',
            'editable.suffix'
          ],
          '.tmp/editable-test.js': [
            'editable.prefix',
            'src/util/*.js',
            'src/core.js',
            'src/!(core).js',
            'spec/**/*.js',
            'editable.suffix'
          ]
        }
      }
    },
    uglify: {
      dist: {
        files: {
          'dist/editable.min.js': [
            'dist/editable.js'
          ],
        }
      }
    }
  });

  // livereload does not work with grunt-contrib-watch, so we use regarde instead
  // https://github.com/gruntjs/grunt-contrib-watch/issues/59
  grunt.renameTask('regarde', 'watch');

  grunt.registerTask('server', [
    'clean:server',
    'concat:editable',
    'livereload-start',
    'connect:livereload',
    'open',
    'watch:livereload'
  ]);

  grunt.registerTask('test', [
    'clean:server',
    'concat:editable',
    'karma:unit'
  ]);

  grunt.registerTask('lint', [
    'jshint'
  ]);

  grunt.registerTask('dev', [
    'concat:editable',
    'watch:src'
  ]);

  grunt.registerTask('build', [
    'jshint',
    'clean:dist',
    'clean:server',
    'concat:editable',
    // 'karma:build',
    'concat:dist',
    'uglify'
  ]);

  grunt.registerTask('default', ['server']);
};
