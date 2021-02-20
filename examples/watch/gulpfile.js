const {
	src,
	dest,
	watch,
} = require('gulp')
const {createGulpEsbuild} = require('gulp-esbuild')
const gulpEsbuild = createGulpEsbuild({
	incremental: true,
})

function build() {
	return src('src/*')
		.pipe(gulpEsbuild())
		.pipe(dest('dist'))
}

function watchTask() {
	watch(['src/*'], build)
}

exports.build = build
exports.watch = watchTask
