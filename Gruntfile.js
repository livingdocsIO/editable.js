'use strict';

module.exports = function(grunt) {

  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    watch: {
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '*.html',
          '.tmp/{,*/}*.js',
          'test/js/{,*/}*.js',
          'test/css/{,*/}*.css'
        ],
      },
      src: {
        files: [
          'src/{,*/}*.js',
          'spec/**/*.spec.js'
        ],
        tasks: ['browserify']
      },
      examples: {
        files: [
          'examples/js/*.jsx'
        ],
        tasks: ['react']
      }
    },

    connect: {
      options: {
        port: 9050,
        // Change this to '*' to access the server from outside.
        hostname: '*',
        livereload: 35759 // Default livereload listening port: 35729
      },
      livereload: {
        options: {
          open: 'http://localhost:9050/',
          base: [
            '.tmp',
            'examples',
            './'
          ]
        }
      }
    },

    react: {
      examples: {
        files: {
          '.tmp/js/react.js': 'examples/js/react.jsx'
        }
      }
    },

    clean: {
      server: '.tmp',
      test: '.tmp/editable-test.js'
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'src/{,*/}*.js',
        'spec/{,*/}*.js'
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
            '.tmp/editable.js'
          ]
        }
      }
    },

    browserify: {
      options: {
        alias: {
           'jquery': './src/modules/jquery.js',
           'rangy': './src/modules/rangy.js'
        },
        browserifyOptions: {
          debug: true,
        }
      },
      src: {
        files: {
          '.tmp/editable.js': [
            'src/core.js'
          ]
        }
      },
      test: {
        files: {
          '.tmp/editable-test.js': [
            'spec/*.spec.js'
          ]
        }
      }
    },

    uglify: {
      options: {
         mangle: true,
         compress: true
      },
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
        files: ['package.json', 'bower.json', 'version.json'],
        commitFiles: ['-a'], // '-a' for all files
        pushTo: 'origin'
      }
    },

    shell: {
      npm: {
        command: 'npm publish'
      }
    },

    revision: {
      options: {
        property: 'git.revision',
        ref: 'HEAD',
        short: true
      }
    },

    replace: {
      revision: {
        options: {
          patterns: [
            {
              match: /\"revision\": ?\"[a-z0-9]+\"/,
              replacement: '"revision": "<%= git.revision %>"'
            }
          ]
        },
        files: {
          'version.json': ['version.json']
        }
      }
    }
  });

  grunt.registerTask('test', [
    'clean:test',
    'browserify:test',
    'karma:unit'
  ]);

  grunt.registerTask('lint', [
    'jshint'
  ]);

  grunt.registerTask('dev', [
    'clean:server',
    'browserify:src',
    'react',
    'connect',
    'watch'
  ]);

  grunt.registerTask('build', [
    'jshint',
    'clean:server',
    'add-revision',
    'browserify',
    'karma:build',
    'concat:dist',
    'uglify'
  ]);

  grunt.registerTask('devbuild', [
    'clean:server',
    'browserify:src',
    'concat:dist',
    'uglify'
  ]);

  grunt.registerTask('add-revision', ['revision', 'replace:revision']);

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
