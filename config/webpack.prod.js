'use strict';

const helpers = require('./helpers');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const commonConfig = require('./webpack.common.js'); // the settings that are common to prod and dev

/**
 * Webpack Plugins
 */
const DefinePlugin = require('webpack/lib/DefinePlugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

/**
 * Webpack Constants
 */
const ENV = process.env.ENV = process.env.NODE_ENV = 'prod';
const METADATA = webpackMerge(commonConfig.metadata, {
  ENV: ENV,
  baseUrl: '/demo/'
});

/**
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = webpackMerge.smart(commonConfig, {

  /**
   * Merged metadata from webpack.common.js for index.html
   *
   * See: (custom attribute)
   */
  metadata: METADATA,

  /**
   * Switch loaders to debug mode.
   *
   * See: http://webpack.github.io/docs/configuration.html#debug
   */
  debug: false,

  plugins: [
    /**
     * Plugin: DefinePlugin
     * Description: Define free variables.
     * Useful for having development builds with debug logging or adding global constants.
     *
     * Environment helpers
     *
     * See: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
     */
    // NOTE: when adding more properties, make sure you include them in custom-typings.d.ts
    new DefinePlugin({
      'ENV': JSON.stringify(METADATA.ENV),
      'HMR': METADATA.HMR,
      'process.env': {
        'ENV': JSON.stringify(METADATA.ENV),
        'NODE_ENV': JSON.stringify(METADATA.ENV),
        'HMR': METADATA.HMR,
      }
    }),
    new UglifyJsPlugin({
      compress: {
        warnings: false,
      },
      output: {
        comments: false,
      },
    }),
  ],

  /**
   * Static analysis linter for TypeScript advanced options configuration
   * Description: An extensible linter for the TypeScript language.
   *
   * See: https://github.com/wbuchwalter/tslint-loader
   */
  tslint: {
    emitErrors: true,
  },
});
