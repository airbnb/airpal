var gulp, gutil, source, watchify, browserify,
    reactify, paths, uglify, buffer, livereload;

// Require all file dependencies
gulp        = require('gulp'),
gutil       = require('gulp-util'),
source      = require('vinyl-source-stream'),
buffer      = require('vinyl-buffer'),
watchify    = require('watchify'),
browserify  = require('browserify'),
reactify    = require('reactify'),
uglify      = require('gulp-uglify');

// Keep track of all paths
paths = {
  scripts: ['./js/**/*.js']
};

// Create a "browserify" task
gulp.task('browserify', function() {
  watchify(browserify('./js/app.js', {
    transform: [reactify],
    cache: {},
    packageCache: {},
    fullPaths: false
  }))
    .bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./build/javascripts'));
});

// Create a "watch" task
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['browserify']);
});