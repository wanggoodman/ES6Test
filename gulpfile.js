"use strict";

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//-* NodeJs LIBs
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var libPath = require('path');

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//-* GULP & Others
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
var gulp = require('gulp');
var rimraf = require('gulp-rimraf');
var gutil = require('gulp-util');
var babel = require('gulp-babel');
var runSequence = require('run-sequence');
var shell = require('gulp-shell');
var lodash = require('lodash');
var gulpif = require('gulp-if');
var eslint = require('gulp-eslint');
var rename = require('gulp-rename');
var ignore = require('gulp-ignore');

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//-* UTILITIES
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
function handleError(err) {
  gutil.log('[Error]', err.toString({
    colors: true
  }));
  this.emit('end');
}

gutil.log(
  gutil.colors.yellow('GLOBAL'),
  gutil.colors.magenta('ENV'),
  gutil.colors.magenta('PLATFORM')
);

//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
//-* TASKS
//-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
gulp.task('clean', function () { // 清理任务，删除所有最终输出结果
  return gulp.src([libPath.join('ES5')], {read: false})
    .pipe(rimraf())
    .on('error', handleError);
});

gulp.task('build', function () { // 源代码 babel 转码
  return gulp.src([
    libPath.join('ES6', '**', '*.js')
  ])
  .pipe(babel({
    'presets': [
      'es2015',
      'stage-3'
    ],
    'plugins': [
      'transform-async-to-generator'
    ]
  }))
  .pipe(gulp.dest(libPath.join('ES5')));
});

gulp.task('default', function (done) { // 默认任务
  runSequence(
    'clean',
    'build',
    done
  );
});