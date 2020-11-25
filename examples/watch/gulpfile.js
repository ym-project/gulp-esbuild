const {
	src,
	dest,
	watch,
} = require('gulp')
const {createGulpEsbuild} = require('../..')
const gulpEsbuild = createGulpEsbuild()

function build() {
	return src('src/*')
		.pipe(gulpEsbuild({
			outdir: '.',
		}))
		.pipe(dest('dist'))
}

function watchTask() {
	watch(['src/*'], build)
}

exports.build = build
exports.watch = watchTask
