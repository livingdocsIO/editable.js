process.env.BUILD_TEST = 'true'
/* eslint-disable no-unused-vars */
const {
  entry: _entry,
  output: _output,
  ...webpackConfig
} = require('./webpack.config')
/* eslint-enable no-unused-vars */

module.exports = function (config) {
  config.set({
    basePath: './',

    frameworks: ['mocha', 'webpack'],

    plugins: [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-safari-launcher',
      'karma-coverage',
      'karma-mocha',
      'karma-sourcemap-loader',
      'karma-webpack'
    ],

    files: [{
      pattern: 'spec/*.spec.js',
      watched: false
    }],

    preprocessors: {
      'spec/*.spec.js': ['webpack', 'sourcemap']
    },

    coverageReporter: {
      dir: 'coverage',
      reporters: [
        {type: 'lcov', subdir: 'lcov'},
        {type: 'text-summary', subdir: '.'}
      ]
    },

    webpack: webpackConfig,

    webpackMiddleware: {noInfo: true},

    reporters: ['dots', 'coverage'],

    port: 9876,

    runnerPort: 9100,

    logLevel: config.LOG_INFO,

    autoWatch: true,

    browsers: ['ChromeHeadlessNoSandbox'],

    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },

    captureTimeout: 8000,

    singleRun: true,

    reportSlowerThan: 500
  })
}
