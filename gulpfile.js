/*!
 * zencanvas
 * Copyright (c) 2014 Nicolas Gryman <ngryman@gmail.com>
 */

'use strict';

var gulp = require('gulp')
  , gulpif = require('gulp-if')
  , browserify = require('browserify')
  , exorcist = require('exorcist')
  , source = require('vinyl-source-stream')
  , sass = require('gulp-sass')
  , rename = require('gulp-rename')
  , prefix = require('gulp-autoprefixer')
  , jshint = require('gulp-jshint')
  , concat = require('gulp-concat')
  , browserSync = require('browser-sync')
  , reload = browserSync.reload;

var projectName = 'zencanvas';

var watching = false;

var globs = {
  app: ['app/{,*/}*.js'],
  sass: ['sass{,*/}*.scss'],
  assets: ['assets/**/*']
};

var paths = {
  app: 'app/index.js',
  sass: 'sass/index.scss',
  dist: 'dist/'
};

var bundler = browserify({
  entries: './' + paths.app,
  debug: true
});

gulp.task('browser-sync', function() {
  browserSync({
    open: false,
    server: {
      baseDir: paths.dist
    }
  });
  watching = true;
});

gulp.task('lint', function() {
  return gulp.src(globs.app)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('browserify', function() {
  var stream = bundler.bundle()
    .on('error', onError)
	  .pipe(exorcist(paths.dist + projectName + '.js.map'))
    .pipe(source(projectName + '.js'))
    .pipe(gulp.dest(paths.dist))
    .pipe(gulpif(watching, reload({ stream: true })));
});

gulp.task('sass', function() {
  return gulp.src(paths.sass)
    .pipe(sass({
      // Setting sourceComments to `map` makes sass crash badly when there is a
      // compilation error waiting it to be corrected:
      //   https://github.com/sass/node-sass/issues/337
      sourceComments: 'none'
    }))
    .on('error', onError)
    .pipe(prefix('last 1 version'))
    .pipe(rename(projectName + '.css'))
    .pipe(gulp.dest(paths.dist))
    .pipe(gulpif(watching, reload({ stream: true })));
});

gulp.task('assets', function() {
  return gulp.src(globs.assets)
    .pipe(gulp.dest(paths.dist))
    .pipe(gulpif(watching, reload({ stream: true })));
});

gulp.task('codemirror-assets', function() {
  return gulp.src([
    'node_modules/codemirror/lib/codemirror.css',
    'node_modules/codemirror/theme/monokai.css'
  ])
  .pipe(concat('codemirror.css'))
  .pipe(gulp.dest(paths.dist));
});

gulp.task('build', ['assets', 'codemirror-assets', 'sass', 'lint', 'browserify']);

gulp.task('default', ['build', 'browser-sync'], function() {
  gulp.watch(globs.app, ['lint', 'browserify']);
  gulp.watch(globs.sass, ['sass']);
  gulp.watch(globs.assets, ['assets']);
});

/**
 * Utils.
 */

var gutil = require('gulp-util')
  , notify = require('gulp-notify')
  , isStream = require('isstream')
  , path = require('path')
  , os = require('os');

function onError() {
  var args = Array.prototype.slice.call(arguments);

  // error to notification center with gulp-notify
	if ('win32' != os.platform()) {
		notify.onError({
			title: "Compile Error",
			message: "<%= error.message %>"
		}).apply(this, args);
	}
	else {
		gutil.log("Compile Error", args[0].message, gutil.colors.red);
	}

  // keep gulp from hanging on this task
  if (isStream(this)) this.emit('end');
}
