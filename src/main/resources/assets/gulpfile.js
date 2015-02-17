var gulp        = require('gulp');
var gutil       = require('gulp-util');
var source      = require('vinyl-source-stream');
var buffer      = require('vinyl-buffer');
var browserify  = require('browserify');
var reactify    = require('reactify');
var uglify      = require('gulp-uglify');

// Keep track of all paths
var paths = {
  scripts: ['./js/**/*.js'],
};

// Create a "browserify" task
gulp.task('browserify', function() {
  browserify('./js/app.js', {
    transform: [reactify],
    cache: {},
    packageCache: {},
    fullPaths: false
  })
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
