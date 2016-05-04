var path = require('path')

process.env.BUILD_TEST = 'true'
var webpackConfig = require('./webpack.config')
delete webpackConfig.entry
delete webpackConfig.output
webpackConfig.module.preLoaders = [{
  test: /\.js$/,
  include: path.resolve('src/'),
  loader: 'babel-istanbul'
}]

module.exports = function (config) {
  config.set({
    basePath: './',

    frameworks: ['jasmine'],

    files: [{
      pattern: 'spec/*.spec.js',
      watched: false
    }],

    preprocessors: {
      'spec/*.spec.js': ['webpack', 'sourcemap']
    },

    coverageReporter: {
      dir: 'coverage',
      reporters: [{ type: 'lcov', subdir: 'lcov' }]
    },

    webpack: webpackConfig,

    webpackMiddleware: {noInfo: true},

    reporters: ['progress', 'coverage'],

    port: 9876,

    runnerPort: 9100,

    logLevel: config.LOG_INFO,

    autoWatch: true,

    browsers: ['PhantomJS2'],

    captureTimeout: 8000,

    singleRun: true,

    reportSlowerThan: 500
  })
}
