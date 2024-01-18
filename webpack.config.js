const webpack = require('webpack')

const dev = process.env.WEBPACK_DEV === 'true'
const production = !dev

const dist = process.env.BUILD_DIST === 'true'
const docs = process.env.BUILD_DOCS === 'true'
const test = process.env.BUILD_TEST === 'true'


module.exports = {
  mode: dev ? 'development' : 'production',
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
    libraryExport: 'Editable',
    path: __dirname,
    filename: '[name].js'
  },
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
    nodeEnv: production ? 'production' : false
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ],
  ...(dev ? {
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
