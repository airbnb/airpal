var gulp, gutil, source, watchify, browserify, bundler,
    reactify, paths, uglify, buffer, livereload, minifyCSS,
    concat;

// Require all file dependencies
gulp        = require('gulp'),
gutil       = require('gulp-util'),
source      = require('vinyl-source-stream'),
buffer      = require('vinyl-buffer'),
browserify  = require('browserify'),
reactify    = require('reactify'),
uglify      = require('gulp-uglify'),
minifyCSS   = require('gulp-minify-css'),
concat      = require('gulp-concat');

// Keep track of all paths
paths = {
  scripts: ['./js/**/*.js'],
  plugins: ['./js/plugins/*.js'],
  stylesheets: ['./css/**/*.css'],
  fonts: ['./fonts/*']
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
    .pipe(source('application.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./build/javascripts'));
});

// Create a "plugins" task
gulp.task('plugins', function() {
  browserify('./js/plugins/_plugins.js', {
    fullPaths: false
  })
    .bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('plugins.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./build/javascripts'));
});

// Create a "css" task
gulp.task('css', function() {
  gulp.src(paths.stylesheets)
    .pipe(concat('application.css'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./build/stylesheets'));
});

// Create a "fonts" task
gulp.task('fonts', function() {
  gulp.src(paths.fonts)
    .pipe(gulp.dest('./build/stylesheets/fonts'));
});

// Create a "watch" task
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['browserify']);
  gulp.watch(paths.plugins, ['plugins']);
  gulp.watch(paths.stylesheets, ['css', 'fonts']);
});
