import gulp from "gulp";
import concat from "gulp-concat";
import autoPrefixer from "gulp-autoprefixer";
import cleanCSS from "gulp-clean-css";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import uglify from "gulp-uglify";
import { deleteSync } from "del";
import browserSync from "browser-sync";
import imagemin from "gulp-imagemin";
import gcmq from "gulp-group-css-media-queries";
import sourcemaps from "gulp-sourcemaps";
import babel from "gulp-babel";
import transform from "gulp-es6-module-jstransform";

const sass = gulpSass(dartSass);

async function preproc() {
	return gulp.src("./src/sass/**/*.scss")
		.pipe(sass().on("error", sass.logError))
		.pipe(gcmq())
		.pipe(sourcemaps.init())
		.pipe(concat("style.css"))
		.pipe(autoPrefixer({
			overrideBrowserslist: ["last 2 versions"],
			cascade: false
		}))
		.pipe(cleanCSS({
			level: 2
		}))
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest("./build/css"))
		.pipe(browserSync.stream());
}

async function scripts() {
	return gulp.src("./src/js/**/*.js")
	.pipe(sourcemaps.init())
	.pipe(concat("all.js"))
	.pipe(babel({
		presets: ["@babel/env"]
	}))
	.pipe(transform())
	.pipe(uglify({
		toplevel: true
	}))
	.pipe(sourcemaps.write("."))
	.pipe(gulp.dest("./build/js"))
	.pipe(browserSync.stream());
}

async function img() {
	return gulp.src("./src/images/**/*")
		.pipe(imagemin())
		.pipe(gulp.dest("./build/images"));
}

async function clean() {
	return deleteSync(["./build/*"]);
}

async function fonts() {
	return gulp.src("./src/fonts/**/*")
		.pipe(gulp.dest("./build/fonts"));
}

async function htmls() {
	return gulp.src("./src/*.html")
		.pipe(gulp.dest("./build/"))
		.pipe(browserSync.stream());
}

async function watch () {
	browserSync.init({
		server: {
			baseDir: "./build"
		},
		tunnel: false
	});

	gulp.watch("./src/sass/**/*.scss", preproc);
	gulp.watch("./src/js/**/*.js", scripts);
	gulp.watch("./src/*.html", htmls);
	gulp.watch("./*.html").on("change", browserSync.reload);
}

gulp.task("watch", watch);

gulp.task("build", gulp.series(clean, gulp.parallel(htmls, preproc, scripts, img, fonts)));

gulp.task("dev", gulp.series("build", "watch"));
