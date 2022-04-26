let debug = false;

const gulp = require('gulp'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    terser = require('gulp-terser'),
    header = require('gulp-header-comment'),
    cssmin = require('gulp-cssmin'),
    sassGlob = require('gulp-sass-glob'),
    sass   = require('gulp-sass')(require('node-sass'));
    maps   = require('gulp-sourcemaps');

const paths = {
        prefix: 'ndjson-player',
        build: 'dist/',
		build_min: 'min/js/',
        js: 'src/js/*.js',
	    scss: 'src/scss/*.scss',
		css: 'dist/css/'
};

const headers = `
Author : A.Lepe (dev@alepe.com) 
License: <%= pkg.license %>
Version: <%= pkg.version %>
Updated: <%= moment().format('YYYY-MM-DD') %>
Content: <%= file.name %> `;

// Each file
gulp.task('jsm', gulp.series([], function() {
        return gulp.src(paths.js)
                .pipe(maps.init())
				.pipe(rename({ extname : "" })) //remove extensions
				.pipe(rename({ extname : ".min.js" }))
                .pipe(terser())
                .pipe(header(headers + "(Minimized)"))
                .pipe(maps.write(''))
                .pipe(gulp.dest(paths.build_min));
}));
// Bundle
gulp.task('js', gulp.series([], function() {
        return gulp.src(paths.js)
                .pipe(maps.init())
                .pipe(concat(paths.prefix + '.min.js'))
                .pipe(terser())
                .pipe(maps.write())
                .pipe(header(headers + "(Bundle Minimized)"))
                .pipe(maps.write(''))
                .pipe(gulp.dest(paths.build));
}));
// Source only for development
gulp.task('dev', gulp.series([], function() {
        return gulp.src(paths.js)
                .pipe(concat(paths.prefix + (debug ? '.min.js' : '.src.js')))
                .pipe(header(headers + "(Bundle Source)"))
                .pipe(gulp.dest(paths.build));
}));
// SCSS/CSS
gulp.task('css', gulp.series([], function () {
    return gulp.src(paths.scss)
        .pipe(maps.init())
		.pipe(sassGlob())
        .pipe(sass().on('error', sass.logError))
        .pipe(cssmin())
        .pipe(rename({ extname : "" })) //remove extensions
        .pipe(rename({ extname : ".min.css" }))
        .pipe(maps.write(''))
        .pipe(gulp.dest(paths.css));
}));


// Build
gulp.task('default', gulp.series(['jsm', 'js','dev','css']));
