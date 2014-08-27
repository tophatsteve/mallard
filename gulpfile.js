var fs = require('fs');
var gulp = require('gulp');
var changelog = require('conventional-changelog');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var stylish = require('jshint-stylish');
var coveralls = require('gulp-coveralls');
var bump = require('gulp-bump');
var git = require('gulp-git');

// ------------------------ DEV tasks
gulp.task('test', ['lint'], function () {
    return gulp.src('test/*.js')
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('lint', function() {
    return gulp.src(['gulpfile.js', 'index.js', 'lib/*.js', 'test/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'));
});

gulp.task('coverage', function(cb) {
  return gulp.src(['lib/**/*.js', 'index.js'])
    .pipe(istanbul())
    .on('finish', function () {
      gulp.src(['test/*.js'])
        .pipe(mocha())
        .pipe(istanbul.writeReports())
        .on('end', cb);
    });
});

gulp.task('watch', function() {
    return gulp.watch(['lib/*.js', 'index.js'], ['lint', 'test']);
});

gulp.task('coveralls', ['coverage'], function() {
  return gulp.src('coverage/**/lcov.info')
  .pipe(coveralls());
});

// ------------------------ RELEASE tasks

gulp.task('bump', function(){
  return gulp.src('./package.json')
  .pipe(bump({type:'minor'}))
  .pipe(gulp.dest('./'));
});

gulp.task('tag', ['changelog'], function () {
  var pkg = require('./package.json');
  var v = 'v' + pkg.version;
  var message = 'Release ' + v;

  return gulp.src('./')
    .pipe(git.commit(message))
    .pipe(git.tag(v, message))
    .pipe(git.push('origin', 'master', '--tags'))
    .pipe(gulp.dest('./'));
});

gulp.task('changelog', ['bump'], function(done){
  function changeParsed(err, log){
    if (err) {
      return done(err);
    }
    fs.writeFile('CHANGELOG.md', log, done);
  }
  fs.readFile('./package.json', 'utf8', function(err, data){
    var ref$, repository, version;
    ref$ = JSON.parse(data);
    repository = ref$.repository;
    version = ref$.version;
    return changelog({
      repository: repository.url,
      version: version
    }, changeParsed);
  });
});

gulp.task('default', ['dev']);
gulp.task('dev', ['watch']);
gulp.task('ci', ['coverage', 'coveralls']);
gulp.task('release', ['tag']);
