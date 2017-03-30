const gulp = require("gulp");
const spritesmith = require("gulp.spritesmith");
const texturepacker = require("spritesmith-texturepacker");

gulp.task("sprites", () => {
  return gulp.src("./src/sprites/*.png")
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
