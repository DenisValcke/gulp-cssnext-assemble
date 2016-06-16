var postcss = require('gulp-postcss'),
    gulp = require('gulp'),
    atImport = require('postcss-import'),
    cssnext= require('postcss-cssnext'),
    cleanCSS = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    browserSync = require('browser-sync').create(),
    extname = require ('gulp-extname'),
    assemble = require('assemble'),
    assembleApp = assemble();

gulp.task('load', function(cb) {
  assembleApp.partials('app/templates/partials/*.hbs');
  assembleApp.layouts('app/templates/layouts/*.hbs');
  assembleApp.pages('app/*.hbs');
  cb();
});

gulp.task('assemble', ['load'], function() {
  return assembleApp.toStream('pages')
    .pipe(assembleApp.renderFile())
    .pipe(extname())
    .pipe(assembleApp.dest('dist'));
});

gulp.task('css', function(){
  var processors = [
    atImport,
    cssnext({
      'customProperties': true,
      'colorFunction': true,
      'customSelectors': true,
      'nesting': true
    })
  ];

  return gulp.src('./app/css/main.css')
    .pipe(postcss(processors))
    .pipe(cleanCSS())
    .pipe(gulp.dest('./dist/app/css'))
    .pipe(browserSync.stream());
});

gulp.task('js', function() {
  gulp.src('app/js/vendors/*.js')
    .pipe(concat('vendor.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/app/js/'));

  gulp.src('app/js/main.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/app/js'));
});

gulp.task('copy-assets', function() {
   gulp.src('./app/assets/**/*.{eot,ttf,woff,woff2,svg,png,jpg,gif}')
    .pipe(gulp.dest('./dist/app/assets/'));
});

gulp.task('build', ['assemble', 'css', 'js', 'copy-assets']);

gulp.task('serve', ['build'], function(){
  browserSync.init({
    server: {
      baseDir: './dist/app',
      index: 'index.html'
    }
  });

  gulp.watch('app/css/**/*.css', ['css']);
  gulp.watch('app/js/**/*.js', ['js']);
  gulp.watch('app/*.hbs', ['assemble']);
  gulp.watch('app/templates/**/*.hbs', ['assemble']);
  gulp.watch('app/assets/**/*.{eot,ttf,woff,woff,svg,png,jpg,gif}', ['copy-assets']);
  gulp.watch('dist/app/js/*.js').on('change', browserSync.reload);
  gulp.watch('dist/app/css/*.css').on('change', browserSync.reload);
  gulp.watch('dist/app/*.html').on('change', browserSync.reload);
  gulp.watch('dist/app/assets/**/*.{eot,ttf,woff,woff,svg,png,jpg,gif}').on('change', browserSync.reload);
});

gulp.task('default',['serve']);
