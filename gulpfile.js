const gulp = require('gulp'),
	concat = require('gulp-concat'),
	terser = require('gulp-terser'),
	cssmin = require('gulp-cssmin'),
	sassGlob = require('gulp-sass-glob'),
	sass   = require('gulp-sass'),
	del    = require('del');

const paths = {
	prefix: 'ndjson-player',
	build: 'dist',
	src: 'src',
	js: [
		'src/js/m2d2.min.js',
		'src/js/timer.src.js',
		'src/js/ndjson-player.src.js',
		'src/js/ndjson-ui.src.js',
		'src/js/video-nd.src.js',
	],
	css: ['src/css/*.css'],
	scss: ['src/scss/*.scss'],
	scss_out : 'src/css/'
};

gulp.task('clean', function(cb) {
  del(paths.build, cb);
});

gulp.task('js', ["clean"], function() {
	return gulp.src(paths.js)
		.pipe(terser())
		.pipe(concat(paths.prefix + '.min.js'))
		.pipe(gulp.dest(paths.build));
});

gulp.task('js-dev', ["clean"], function() {
	return gulp.src(paths.js)
		.pipe(concat(paths.prefix + '.dev.js'))
		.pipe(gulp.dest(paths.build));
});

sass.compiler = require('node-sass');
gulp.task('sass', ["clean"], function () {
	return gulp.src(paths.scss)
		.pipe(sassGlob())
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest(paths.scss_out));
});

gulp.task('css', ["clean", "sass"], function() {
	return gulp.src(paths.css)
		.pipe(cssmin())
		.pipe(concat(paths.prefix +  '.min.css'))
		.pipe(gulp.dest(paths.build));
});

// Watch
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['js']);
  gulp.watch(paths.styles, ['css']);
  gulp.watch(paths.scss, ['sass']);
});

// Build
gulp.task('default', ['clean', 'js', 'js-dev', 'sass', 'css']);
