/**
 * WEBPACK CONFIG
 *
 * Notes on config properties:
 *
 * 'entry'
 * Entry point for the bundle.
 *
 * 'output'
 * If you pass an array - the modules are loaded on startup. The last one is exported.
 *
 * 'resolve'
 * Array of file extensions used to resolve modules.
 *
 * devtool: 'eval-source-map'
 * http://www.cnblogs.com/Answer1215/p/4312265.html
 * The source map file will only be downloaded if you have source maps enabled
 * and your dev tools open.
 *
 * OccurrenceOrderPlugin
 * Assign the module and chunk ids by occurrence count. Ids that are used often
 * get lower (shorter) ids. This make ids predictable, reduces to total file size
 * and is recommended.
 *
 * UglifyJsPlugin
 * Minimize all JavaScript output of chunks. Loaders are switched into minimizing mode.
 *    - 'compress'
 *      Compressor is a tree transformer which reduces the code size by applying
 *      various optimizations on the AST.
 *
 * 'NODE_ENV'
 * React relies on process.env.NODE_ENV based optimizations.
 * If we force it to production, React will get in an optimized manner.
 * This will disable some checks (eg. property type checks) and give you a smaller
 *    build and improved performance.
 *
 *    Note: That JSON.stringify is needed as webpack will perform string replace
 *    "as is". In this case we'll want to end up with strings as that's what
 *    various comparisons expect, not just production. Latter would just cause
 *    an error.
 *
 * 'babel'
 * Babel enables the use of ES6 today by transpiling your ES6 JavaScript into
 * equivalent ES5 source that is actually delivered to the end user browser.
 */

const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './scripts/index',
  output: {
    path: path.join(__dirname, 'prod'),
    filename: 'bundle-[chunkhash].js',
    publicPath: './'
  },
  resolve: {
    extensions: ['', '.js', ".jsx"]
  },
  //devtool: 'source-map',
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new HtmlWebpackPlugin({
      template: 'index.ejs'
    }),
    new WebpackCleanupPlugin(),
    new CopyWebpackPlugin([
      { from: 'favicon.ico' }
    ])
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel'],
        include: path.join(__dirname, 'scripts')
      },
      {
        test: /\.css$/,
        loader: 'style!css!'
      },
    ]
  },
  externals: {
    'Config': JSON.stringify({
      serverUrl: "http://104.196.247.145:8000"
    }) //you must stringify the config for some reason: http://stackoverflow.com/a/30602665/1621636
  }
};
