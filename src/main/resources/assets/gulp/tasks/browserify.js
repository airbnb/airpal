/* browserify task
   ---------------
   Bundle javascripty things with browserify!

   This task is set up to generate multiple separate bundles, from
   different sources, and to use Watchify when run from the default task.

   See browserify.bundleConfigs in gulp/config.js
*/

var browserify   = require('browserify');
var watchify     = require('watchify');
var bundleLogger = require('../util/bundleLogger');
var gulp         = require('gulp');
var handleErrors = require('../util/handleErrors');
var source       = require('vinyl-source-stream');
var allConfig    = require('../config');
var isDevelopment = allConfig.isDevelopment;
var config       = allConfig.browserify;

gulp.task('browserify', function(callback) {

  var bundleQueue = config.bundleConfigs.length;

  function browserifyThis(bundleConfig) {

    var bundler = browserify({

      // Required watchify args
      cache: {}, packageCache: {}, fullPaths: true,

      // Specify the entry point of your app
      entries: bundleConfig.entries,

      // Add file extensions to make optional in your requires
      extensions: config.extensions,

      // Enable source maps!
      debug: config.debug
    });

    function bundle() {
      // Log when bundling starts
      bundleLogger.start(bundleConfig.outputName);

      if (!isDevelopment) {
        // Make sure to minify before bundling
        bundler.plugin('minifyify', {
          map: 'app.min.map',
          output: bundleConfig.dest + '/app.min.map'
        })
      }

      return bundler.bundle()

        // Report compile errors
        .on('error', handleErrors)

        // Use vinyl-source-stream to make the
        // stream gulp compatible. Specifiy the
        // desired output filename here.
        .pipe(source(bundleConfig.outputName))

        // Specify the output destination
        .pipe(gulp.dest(bundleConfig.dest))
        .on('end', reportFinished);
    }

    if (global.isWatching) {

      // Wrap with watchify and rebundle on changes
      bundler = watchify(bundler);

      // Rebundle on update
      bundler.on('update', bundle);
    }

    function reportFinished() {

      // Log when bundling completes
      bundleLogger.end(bundleConfig.outputName)

      if (bundleQueue) {
        bundleQueue--;
        if (bundleQueue === 0) {

          // If queue is empty, tell gulp the task is complete.
          // https://github.com/gulpjs/gulp/blob/master/docs/API.md#accept-a-callback
          callback();
        }
      }
    }

    return bundle();
  }

  // Start bundling with Browserify for each bundleConfig specified
  config.bundleConfigs.forEach(browserifyThis);
});
