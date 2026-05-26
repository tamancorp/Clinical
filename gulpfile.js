var gulp = require('gulp');
const sassImpl = require('sass');
var sass = require('gulp-sass')(sassImpl);
var browserSync = require('browser-sync').create();
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pkg = require('./package.json');

// Set the banner content
var banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  ''
].join('');

// Compiles SCSS files from /scss into /css
gulp.task('sass', function() {
  return gulp.src('scss/creative.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.reload({ stream: true }))
});

// Minify compiled CSS
gulp.task('minify-css', gulp.series('sass', function() {
  return gulp.src('css/creative.css')
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.reload({ stream: true }))
}));

// Minify custom JS
gulp.task('minify-js', function() {
  return gulp.src('js/creative.js')
    .pipe(uglify())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('js'))
    .pipe(browserSync.reload({ stream: true }))
});

// Copy vendor files from /node_modules into /vendor
gulp.task('copy', function(done) {
  gulp.src([
      'node_modules/bootstrap/dist/**/*',
      '!**/npm.js',
      '!**/bootstrap-theme.*',
      '!**/*.map'
    ])
    .pipe(gulp.dest('vendor/bootstrap'))
  gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
    .pipe(gulp.dest('vendor/jquery'))
  gulp.src(['node_modules/magnific-popup/dist/*'])
    .pipe(gulp.dest('vendor/magnific-popup'))
  gulp.src(['node_modules/scrollreveal/dist/*.js'])
    .pipe(gulp.dest('vendor/scrollreveal'))
  gulp.src(['node_modules/popper.js/dist/umd/popper.js', 'node_modules/popper.js/dist/umd/popper.min.js'])
    .pipe(gulp.dest('vendor/popper'))
  gulp.src(['node_modules/jquery.easing/*.js'])
    .pipe(gulp.dest('vendor/jquery-easing'))
  gulp.src([
      'node_modules/font-awesome/**',
      '!node_modules/font-awesome/**/*.map',
      '!node_modules/font-awesome/.npmignore',
      '!node_modules/font-awesome/*.txt',
      '!node_modules/font-awesome/*.md',
      '!node_modules/font-awesome/*.json'
    ])
    .pipe(gulp.dest('vendor/font-awesome'))
  done();
});

// Build task (reemplaza 'default' para Netlify)
gulp.task('build', gulp.series('sass', 'minify-css', 'minify-js', 'copy'));

// Default task
gulp.task('default', gulp.series('sass', 'minify-css', 'minify-js', 'copy'));

// Configure the browserSync task
gulp.task('browserSync', function(done) {
  browserSync.init({
    server: { baseDir: '' }
  });
  done();
});

// Dev task with browserSync
gulp.task('dev', gulp.series('browserSync', 'sass', 'minify-css', 'minify-js', function(done) {
  gulp.watch('scss/*.scss', gulp.series('sass'));
  gulp.watch('css/*.css', gulp.series('minify-css'));
  gulp.watch('js/*.js', gulp.series('minify-js'));
  gulp.watch('*.html', browserSync.reload);
  gulp.watch('js/**/*.js', browserSync.reload);
  done();
}));
