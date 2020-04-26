const gulp = require('gulp'),
	concat = require('gulp-concat'),
	babel = require('gulp-babel'),
	//uglify = require('gulp-uglify-es').default,
	terser = require('gulp-terser'),
	cssmin = require('gulp-cssmin'),
	sassGlob = require('gulp-sass-glob'),
	sass   = require('gulp-sass'),
	del    = require('del');

const paths = {
	prefix: 'ndjson-player.min',
	build: 'dist',
	src: 'src',
	js: [
		'src/js/utils.src.js',
		'src/js/m2d2.src.js',
		'src/js/m2d2.*.js',
		'src/js/ndjson-player.*.js',
		'src/js/ndjson-ui.*.js',
		'src/js/*.js'
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
		//.pipe(babel({ presets: ['es2015', 'stage-3'] }))
		//.pipe(terser())
		.pipe(concat(paths.prefix + '.js'))
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
		.pipe(concat(paths.prefix +  '.css'))
		.pipe(gulp.dest(paths.build));
});

// Watch
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['js']);
  gulp.watch(paths.styles, ['css']);
  gulp.watch(paths.scss, ['sass']);
});

// Build
gulp.task('default', ['clean', 'js', 'sass', 'css']);
