const {
	src,
	dest,
	watch,
} = require('gulp')
const gulpEsbuild = require('gulp-esbuild')
const incrementalGulpEsbuild = gulpEsbuild.createGulpEsbuild({
	incremental: true,
})

function devBuild() {
	return src('src/*')
		.pipe(incrementalGulpEsbuild())
		.pipe(dest('./dist'))
}

function productionBuild() {
	return src('src/*')
		.pipe(gulpEsbuild())
		.pipe(dest('./dist'))
}

function watchTask() {
	watch(['src/*'], devBuild)
}

exports.build = productionBuild
exports.watch = watchTask
