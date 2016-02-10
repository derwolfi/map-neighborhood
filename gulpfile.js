var gulp = require('gulp'),
    minifyCss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    pngquant = require('imagemin-pngquant'),
    del = require('del'),
    usemin = require('gulp-usemin'),
    gulpSequence = require('gulp-sequence'),
    foreach = require('gulp-foreach'),
    bowerSrc = require('gulp-bower-src'),
    htmlmin = require('gulp-htmlmin');

// optimize images
gulp.task('images', function() {
  return gulp.src('./src/images/**/*')
    .pipe(cache(imagemin({
      optimizationLevel: 5,
      progressive: true,
      interlaced: true,
      svgoPlugins: [{removeviewsBox: false}],
        use: [pngquant()]
    })))
    .pipe(gulp.dest('./webapp/images'))
    .pipe(notify({ message: 'Images task complete' }));
});

// Copy fonts
// gulp.task('copyfiles', function() {
//   gulp.src('./src/fonts/**/*.{ttf,woff,eof,svg}')
//   .pipe(gulp.dest('./webapp/fonts')),
//   gulp.src('./src/library/**/*')
//   .pipe(gulp.dest('./webapp/library'));
// });

// Copy library
gulp.task('copylib', function() {
  gulp.src('./src/bower_components/**/*')
  .pipe(gulp.dest('./webapp/bower_components'));
});

// Clean
gulp.task('clean', function() {
    return del(['./webapp/css', './webapp/js', './webapp/images', './webapp/*.html']);
});

// gulp.task('default', function () {
//     bowerSrc()
//         .pipe(gulp.dest('webapp/lib'));
// });

// Inject to HTML files

gulp.task('usemin', ['clean'], function() {
  return gulp.src('./src/*.html')
    .pipe(foreach(function (stream, file) {
      return stream.pipe(usemin({
        css: [ minifyCss() ],
        js: [ uglify() ],
        jsAttributes: {
          async: true
        }
      }));
    }))
    .pipe(gulp.dest('./webapp/'));
});

// gulp.task('minify-css', function() {
//   return gulp.src('./src/css/fonts.css')
//     .pipe(minifyCss({compatibility: 'ie8'}))
//     .pipe(gulp.dest('./webapp/css'));
// });

gulp.task('minify-html', function() {
  return gulp.src('./webapp/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('webapp'));
});


// Build all
gulp.task('build', function(done) {
  gulpSequence('usemin', 'images', 'minify-html', 'copylib')(done);
});