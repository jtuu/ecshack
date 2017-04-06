const gulp = require("gulp");
const spritesmith = require("gulp.spritesmith");
const texturepacker = require("spritesmith-texturepacker");
const webpackConfig = require("./webpack.config.js");
const webpack = require("webpack");
const webpackStream = require("webpack-stream");
const plumber = require("gulp-plumber");

const moveFiles = [
  "src/GlobalConstants.js"
];

gulp.task("copy", () => {
  return gulp.src(moveFiles)
    .pipe(gulp.dest("build"));
});

gulp.task("copy:watch", () => {
  gulp.watch(moveFiles, ["copy"]);
});

gulp.task("sprites", () => {
  return gulp.src("./src/sprites/*.png")
    .pipe(plumber())
    .pipe(spritesmith({
      imgName: "atlas.png",
      cssName: "atlas.json",
      algorithm: "binary-tree",
      cssTemplate: texturepacker
    }))
    .pipe(gulp.dest("./build/images"));
});

gulp.task("sprites:watch", () => {
  gulp.watch("src/sprites/*.png", ["sprites"]);
});

gulp.task("webpack", () => {
  return gulp.src("src/main")
    .pipe(plumber())
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest("build"));
});

gulp.task("webpack:watch", () => {
  gulp.src("src/main")
    .pipe(plumber())
    .pipe(webpackStream(Object.assign({}, webpackConfig, {watch: true}), webpack))
    .pipe(gulp.dest("build"));
});

gulp.task("build", ["copy", "sprites", "webpack"]);
gulp.task("watch", ["copy:watch", "sprites:watch", "webpack:watch"]);
