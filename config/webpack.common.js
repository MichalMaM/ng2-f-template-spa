'use strict';

const webpack = require('webpack');
const helpers = require('./helpers');

/*
 * Webpack Plugins
 */
// problem with copy-webpack-plugin
var CopyWebpackPlugin = (CopyWebpackPlugin = require('copy-webpack-plugin'), CopyWebpackPlugin.default || CopyWebpackPlugin);
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkCheckerPlugin = require('awesome-typescript-loader').ForkCheckerPlugin;
// use for extract styles to separate file
// const ExtractTextPlugin = require("extract-text-webpack-plugin");

/*
 * Webpack Constants
 */
const HMR = helpers.hasProcessFlag('hot');
const METADATA = {
  title: 'SEED APP', // TODO fill app name
  baseUrl: '/',
  host: 'localhost',
  port: 8080,
  HMR: HMR,
  timestamp: '1'
};

/*
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = {
  /*
   * Static metadata for index.html
   *
   * See: (custom attribute)
   */
  metadata: METADATA,

  /*
   * Cache generated modules and chunks to improve performance for multiple incremental builds.
   * This is enabled by default in watch mode.
   * You can pass false to disable it.
   *
   * See: http://webpack.github.io/docs/configuration.html#cache
   */
  // cache: false,

  /*
   * The entry point for the bundle
   * Our Angular.js app
   *
   * See: http://webpack.github.io/docs/configuration.html#entry
   */
  entry: {
    'polyfills': './src/polyfills.ts',
    'vendor': './src/vendor.ts',
    'app': './src/main.ts',
  },

  output: {
    /**
     * The output directory as absolute path (required).
     *
     * See: http://webpack.github.io/docs/configuration.html#output-path
     */
    path: helpers.root('dist'),


    /**
     * Specifies the name of each output file on disk.
     * IMPORTANT: You must not specify an absolute path here!
     *
     * See: http://webpack.github.io/docs/configuration.html#output-filename
     */
    filename: '[name].bundle.js',

    /**
     * The filename of non-entry chunks as relative path
     * inside the output.path directory.
     *
     * See: http://webpack.github.io/docs/configuration.html#output-chunkfilename
     */
    chunkFilename: '[id].chunk.js'
  },

  /*
   * Options affecting the resolving of modules.
   *
   * See: http://webpack.github.io/docs/configuration.html#resolve
   */
  resolve: {
    /*
     * An array of extensions that should be used to resolve modules.
     *
     * See: http://webpack.github.io/docs/configuration.html#resolve-extensions
     */
    extensions: ['', '.ts', '.js', '.scss', '.html'],

    // Make sure root is src
    root: helpers.root('src'),

    // remove other default values
    modulesDirectories: [helpers.root('node_modules')],

    // fallback is needed for npm link usage
    fallback: helpers.root('node_modules'),

    alias: {
      'angular2/testing': helpers.root('node_modules/@angular/testing/index.js'),
      'angular2/core': helpers.root('node_modules/@angular/core/index.js'),
      'angular2/platform/browser': helpers.root('node_modules/@angular/platform-browser/index.js'),
      'angular2/router': helpers.root('node_modules/@angular/router/index.js'),
      'angular2/http': helpers.root('node_modules/@angular/http/index.js'),
      'angular2/http/testing': helpers.root('node_modules/@angular/http/testing.js'),
      'angular2/http/testing': helpers.root('node_modules/@angular/http/testing.js'),
      'variables.scss': helpers.root('src', 'app', 'styles', '_variables.scss'),
      'mixins.scss': helpers.root('src', 'app', 'styles', '_mixins.scss'),
      'app.scss': helpers.root('src', 'app', 'styles', 'app.scss'),
    },
  },

  // fallback is needed for npm link usage
  resolveLoader: { fallback: helpers.root('node_modules') },

  /*
   * Options affecting the normal modules.
   *
   * See: http://webpack.github.io/docs/configuration.html#module
   */
  module: {
    preLoaders: [
      /*
       * Source map loader support for *.js files
       * Extracts SourceMaps for source files that as added as sourceMappingURL comment.
       *
       * See: https://github.com/webpack/source-map-loader
       */
      {
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: [
          // these packages have problems with their sourcemaps
          //helpers.root('node_modules/rxjs'),
          helpers.root('node_modules/@angular'),
          helpers.root('node_modules/ng2-translate')
        ]
      }
    ],
    loaders: [
      {
        test: /\.ts$/,
        loaders: ['awesome-typescript-loader', 'angular2-template-loader'],
        exclude: [/\.(spec|e2e)\.ts$/]
      },
      {
        test: /\.html$/,
        loader: "raw-loader",
        exclude: [helpers.root('src/index.html')]
      },
      // used for build ng2 components scss files only
      {
        test: /\.scss$/,
        include: helpers.root('src', 'app'),
        exclude: helpers.root('src', 'app', 'styles'),
        loaders: ['raw', 'sass']
      },
      // used for build global styles (include bootstrap fonts etc.)
      {
        test: /\.scss$/,
        include: helpers.root('src', 'app', 'styles', 'main.scss'),
        loaders: ['style', 'css', 'postcss-loader', 'sass']
        // use for extract styles to separate file
        // loader: ExtractTextPlugin.extract(['css', 'postcss-loader', 'sass'])
      },
      {
        test: /\.(woff2?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000'
      },
    ],
    noParse: [
      helpers.root('node_modules/zone.js/dist'),
    ]
  },

  /*
   * Add additional plugins to the compiler.
   *
   * See: http://webpack.github.io/docs/configuration.html#plugins
   */
  plugins: [
    new webpack.DefinePlugin({
      NAME: JSON.stringify(require("../package.json").name),
      VERSION: JSON.stringify(require("../package.json").version)
    }),

    /*
     * Plugin: ForkCheckerPlugin
     * Description: Do type checking in a separate process, so webpack don't need to wait.
     *
     * See: https://github.com/s-panferov/awesome-typescript-loader#forkchecker-boolean-defaultfalse
     */
    new ForkCheckerPlugin(),

    /*
     * Plugin: OccurenceOrderPlugin
     * Description: Varies the distribution of the ids to get the smallest id length
     * for often used ids.
     *
     * See: https://webpack.github.io/docs/list-of-plugins.html#occurrenceorderplugin
     * See: https://github.com/webpack/docs/wiki/optimization#minimize
     */
    new webpack.optimize.OccurenceOrderPlugin(true),

    // /*
    //  * Plugin: CommonsChunkPlugin
    //  * Description: Shares common code between the pages.
    //  * It identifies common modules and put them into a commons chunk.
    //  *
    //  * See: https://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin
    //  * See: https://github.com/webpack/docs/wiki/optimization#multi-page-app
    //  */
    new webpack.optimize.CommonsChunkPlugin({
      name: ['vendor', 'polyfills']
      // name: ['app', 'vendor', 'polyfills'], minChunks: Infinity
    }),

    /*
     * Plugin: CopyWebpackPlugin
     * Description: Copy files and directories in webpack.
     *
     * Copies project static assets.
     *
     * See: https://www.npmjs.com/package/copy-webpack-plugin
     */
    new CopyWebpackPlugin([{
      from: 'src/assets',
      to: 'assets'
    }]),

    // use for extract styles to extra file instead of insertation in style tag
    // new ExtractTextPlugin('styles.[hash].css'),

    /*
     * Plugin: HtmlWebpackPlugin
     * Description: Simplifies creation of HTML files to serve your webpack bundles.
     * This is especially useful for webpack bundles that include a hash in the filename
     * which changes every compilation.
     *
     * See: https://github.com/ampedandwired/html-webpack-plugin
     */
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      chunksSortMode: 'dependency'
    }),

    /*
     * Display time when watch rebuild started.
     *
     * See: https://github.com/webpack/webpack/issues/1499
     */
    function () {
      this.plugin('watch-run', function (watching, callback) {
        console.log('Recompiling began at ' + new Date());
        callback();
      })
    }
  ],

  /**
   * Static analysis linter for TypeScript advanced options configuration
   * Description: An extensible linter for the TypeScript language.
   *
   * See: https://github.com/wbuchwalter/tslint-loader
   */
  tslint: {
    emitErrors: false,
    failOnHint: false,
    resourcePath: 'src'
  },

  /*
   * Include polyfills or mocks for various node stuff
   * Description: Node configuration
   *
   * See: https://webpack.github.io/docs/configuration.html#node
   */
  node: {
    global: 'window',
    crypto: 'empty',
    process: true,
    module: false,
    clearImmediate: false,
    setImmediate: false
  }
};
