const {
	src,
	dest
} = require('gulp')
const gulpEsbuild = require('gulp-esbuild')

function build() {
	return src('src/index.js')
		.pipe(gulpEsbuild({
			outfile: 'app.js',
			bundle: true,
			minify: true,
			format: 'iife',
			target: 'es2015',
			platform: 'browser',
			loader: {
				'.js': 'jsx'
			},
			resolveExtensions: [
				'.js'
			],
			define: {
				'process.env.NODE_ENV': 'production'
			}
		}))
		.pipe(dest('dist'))
}

exports.build = build
