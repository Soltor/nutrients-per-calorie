var gulp        = require('gulp');
var colors      = require('colors');
var spawn       = require('child_process').spawn;
var browserify  = require('browserify');
var watchify    = require('watchify');
var coffeeify   = require('coffeeify');
var vinylSource = require('vinyl-source-stream');

var $ = require('gulp-load-plugins')({
  config: require.resolve('./package.json'),
  lazy: false
});

var paths = {
  dist: './dist',
  distFiles: './dist/**/*'
};

gulp.task('default', ['server', 'scripts', 'watch']); // TODO 'styles' once scss is replaced with less

gulp.task('server', function() {
  var serverStream = spawn('node', ['server.js']);
  serverStream.stdout.on('data', function(data) {
    console.log('\n[' + 'nutrients-per-calorie'.green + '] ' + data);
  });
});

gulp.task('scripts', function() {
  var bundler = watchify(browserify('./src/index.coffee', watchify.args));

  bundler.transform(coffeeify);

  bundler.on('update', rebundle);

  function rebundle() {
    return bundler.bundle()
      .on('error', $.util.log.bind($.util, 'Browserify Error'))
      .pipe(vinylSource('app.js'))
      .pipe(gulp.dest(paths.dist));
  }

  return rebundle();
});

gulp.task('styles', function() {
  spawn('compass watch sass/main.scss');
});

gulp.task('watch', ['server'], function() {
  // $.watch({glob: paths.css}, ['styles']); // TODO once scss is replaced with less
  $.livereload.listen(35729);
  $.watch({glob: paths.distFiles}).on('data', function(file) {
    $.livereload.changed(file.path);
  });
});