var gulp = require('gulp'),
    gutil = require('gulp-util'),
    browserSync = require('browser-sync').create(),
    $ = require('gulp-load-plugins')(),
    paths = require('./config/gulp-paths'),
    opts = require('./config/gulp-options'),
    path = require('path'),
    through = require('through2'),
    lodash = require('lodash._createwrapper');

gulp.task('default', ['less:watch', 'js:watch', 'js:auth:watch', 'lint:watch', 'sync']);

//////////////////////
// BROWSERSYNC
//////////////////////

gulp.task('sync', function() {
    browserSync.init(opts.browserSync);
    gulp.watch(paths.views.src).on('change', browserSync.reload);
});

//////////////////////
// LESS
//////////////////////

gulp.task('less', function() {
  return gulp.src(paths.less.src)
    .pipe($.plumber(opts.plumber))
    .pipe($.less())
    .pipe($.rename(paths.less.filename))
    .pipe(gulp.dest(paths.dest.css))
    .on('error', opts.plumber.errorHandler)
    .pipe($.autoprefixer(opts.autoprefixer))
    .pipe($.cssmin())
    .pipe($.rename(paths.less.min))
    .pipe(gulp.dest(paths.dest.css)).on('error', gutil.log);
});

gulp.task('less:watch', function() {
  gulp.watch(paths.less.watch, ['less:reload']);
});

gulp.task('less:reload', ['less'], function() {
    browserSync.reload();
});

//////////////////////
// JS
//////////////////////

gulp.task('js', function() {
  return gulp.src(paths.js.src)
    .pipe($.plumber(opts.plumber))
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .on('error', opts.plumber.errorHandler)
    .pipe($.concat(paths.js.filename))
    .pipe(gulp.dest(paths.dest.js))
    .pipe($.uglify())
    .pipe($.rename(paths.js.min))
    .pipe(gulp.dest(paths.dest.js))
    .pipe($.sourcemaps.write('.'))
    .on('error', gutil.log);
});

gulp.task('js:watch', function() {
  gulp.watch(paths.js.watch, ['js:reload']);
});

gulp.task('js:reload', ['js'], function() {
    browserSync.reload();
});

gulp.task('js:vendor', function() {
  return gulp.src(paths.js.vendor.src)
    .pipe($.plumber(opts.plumber))
    .pipe($.concat(paths.js.vendor.filename))
    .pipe(gulp.dest(paths.dest.js))
    .pipe($.uglify())
    .pipe($.rename(paths.js.vendor.min))
    .pipe(gulp.dest(paths.dest.js));
});

gulp.task('js:auth', function() {
  return gulp.src(paths.js.auth.src)
    .pipe($.plumber(opts.plumber))
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .on('error', opts.plumber.errorHandler)
    .pipe($.concat(paths.js.auth.filename))
    .pipe(gulp.dest(paths.dest.js))
    .pipe($.uglify())
    .pipe($.rename(paths.js.auth.min))
    .pipe(gulp.dest(paths.dest.js))
    .pipe($.sourcemaps.write('.'))
    .on('error', gutil.log);
});

gulp.task('js:auth:watch', function() {
  gulp.watch(paths.js.watch, ['js:auth:reload']);
});

gulp.task('js:auth:reload', ['js:auth'], function() {
    browserSync.reload();
});

//////////////////////
// LINT
//////////////////////


gulp.task('lint', function() {
  return gulp.src(paths.eslint.src)
    .pipe($.plumber(opts.plumber))
    .pipe($.eslint())
    .on('error', opts.plumber.errorHandler)
    .pipe($.eslint.format('stylish'))
    .pipe($.notify(opts.notify.eslint))
});

gulp.task('lint:watch', function() {
  gulp.watch(paths.eslint.watch, ['lint']);
});

//////////////////////
// NODEMON
//////////////////////

gulp.task('nodemon', function() {
  $.nodemon(opts.nodemon);
});