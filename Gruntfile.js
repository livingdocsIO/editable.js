'use strict';

module.exports = function(grunt) {

  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

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
      options: {
        port: 9050,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35759 // Default livereload listening port: 35729
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            'examples',
            'bower_components'
          ]
        }
      }
    },

    clean: {
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
        browsers: ['Chrome', 'Firefox', 'Safari']
      },
      build: {
        configFile: 'karma.conf.js',
        browsers: ['Chrome', 'Firefox', 'Safari'],
        singleRun: true
      }
    },
    concat: {
      dist: {
        files: {
          'editable.js': [
            'bower_components/rangy/rangy-core.js',
            'bower_components/bowser/bowser.js',
            '.tmp/editable.js'
          ]
        }
      },
      editable: {
        files: {
          '.tmp/editable.js': [
            'editable.prefix',
            'src/util/*.js',
            'src/config.js',
            'src/core.js',
            'src/!(core|config).js',
            'editable.suffix'
          ],
          '.tmp/editable-test.js': [
            'editable.prefix',
            'src/util/*.js',
            'src/config.js',
            'src/core.js',
            'src/!(core|config).js',
            'spec/**/*.js',
            'editable.suffix'
          ]
        }
      }
    },
    uglify: {
      dist: {
        files: {
          'editable.min.js': [
            'editable.js'
          ],
        }
      }
    },
    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        commitFiles: ['-a'], // '-a' for all files
        pushTo: 'origin'
      }
    },
    shell: {
      npm: {
        command: 'npm publish'
      }
    }
  });

  grunt.registerTask('test', [
    'clean:server',
    'concat:editable',
    'karma:unit'
  ]);

  grunt.registerTask('lint', [
    'jshint'
  ]);

  grunt.registerTask('dev', [
    'clean:server',
    'concat:editable',
    'connect',
    'watch'
  ]);

  grunt.registerTask('build', [
    'jshint',
    'clean:server',
    'concat:editable',
    'karma:build',
    'concat:dist',
    'uglify'
  ]);

  grunt.registerTask('devbuild', [
    'clean:server',
    'concat:editable',
    'concat:dist',
    'uglify'
  ]);

  grunt.registerTask('default', ['dev']);


  // Release a new version
  // Only do this on the `master` branch.
  //
  // options:
  // release:patch
  // release:minor
  // release:major
  grunt.registerTask('release', function (type) {
    type = type ? type : 'patch';
    grunt.task.run('bump:' + type);
    grunt.task.run('shell:npm');
  });

};
