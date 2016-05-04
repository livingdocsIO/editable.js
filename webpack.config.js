var OpenBrowserPlugin = require('open-browser-webpack-plugin')
var webpack = require('webpack')

var dist = process.env.BUILD_DIST === 'true'
var docs = process.env.BUILD_DOCS === 'true'
var test = process.env.BUILD_TEST === 'true'

module.exports = {
  devtool: dist || docs || test ? 'sourcemap' : 'eval',
  entry: dist ? {
    'dist/editable': './src/core.js'
  } : {
    'examples/dist/bundle': './examples/index.js',
    'examples/dist/styles': './examples/index.css'
  },
  output: {
    library: dist ? 'Editable' : undefined,
    path: './',
    filename: '[name].js'
  },
  externals: dist && {
    jquery: 'jQuery'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /(node_modules)/,
      loader: 'babel',
      query: {
        presets: ['react', 'es2015']
      }
    }].concat(dist || test ? [] : [{
      test: /\.css$/,
      loaders: ['style', 'css']
    }, {
      test: /\.(png|jpe?g|svg|gif|eot|ttf|woff2?)/,
      loader: 'url'
    }])
  },
  plugins: dist || docs ? [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(true),
    new webpack.optimize.UglifyJsPlugin()
  ].concat(docs ? new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': '"production"'
    }
  }) : []) : test ? [] : [
    new webpack.optimize.CommonsChunkPlugin({
      filename: 'hmr.js',
      name: 'hmr'
    }),
    new OpenBrowserPlugin({url: 'http://localhost:9050/examples/index.html'})
  ],
  devServer: {
    historyApiFallback: true,
    contentBase: './',
    port: 9050
  }
}
