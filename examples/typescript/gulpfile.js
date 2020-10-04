const {
	src,
	dest
} = require('gulp')
const gulpEsbuild = require('gulp-esbuild')

function build() {
	return src('src/*.ts')
		.pipe(gulpEsbuild({
			outdir: '.',
			loader: {
				'.ts': 'ts'
			}
		}))
		.pipe(dest('dist'))
}

exports.build = build
