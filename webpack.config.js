const webpack = require('webpack')

const dist = process.env.BUILD_DIST === 'true'
const docs = process.env.BUILD_DOCS === 'true'
const test = process.env.BUILD_TEST === 'true'

const production = dist || docs || test

module.exports = {
  mode: production ? 'production' : 'development',
  devtool: 'source-map',
  target: 'web',
  entry: {
    ...(dist ? {
      'dist/editable': './src/core.js'
    } : {}),
    ...(docs ? {
      'examples/dist/bundle': './examples/index.js',
      'examples/dist/styles': './examples/index.css'
    } : {})
  },
  output: {
    library: dist ? 'Editable' : undefined,
    libraryTarget: 'umd',
    libraryExport: 'default',
    path: __dirname,
    filename: '[name].js'
  },
  externals: dist ? {
    jquery: 'jQuery'
  } : {},
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: [
                '@babel/plugin-transform-runtime',
                ...(test ? ['babel-plugin-istanbul'] : [])
              ],
              presets: [
                '@babel/preset-env',
                ...(!production || docs ? ['@babel/preset-react'] : [])
              ]
            }
          }
        ]
      },
      ...(docs ? [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }, {
          test: /\.(png|jpe?g|svg|gif|eot|ttf|woff2?)/,
          loader: 'url-loader'
        }
      ] : [])
    ]
  },
  optimization: {
    nodeEnv: dist || docs ? 'production' : false
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ],
  ...(test ? {
    resolve: {
      alias: {
        sinon: 'sinon/pkg/sinon.js'
      }
    }
  } : {}),
  ...(!production ? {
    devServer: {
      static: {
        directory: './'
      },
      port: 9050,
      historyApiFallback: true,
      liveReload: true,
      hot: true,
      open: {
        target: '/examples'
      }
    }
  } : {})
}
