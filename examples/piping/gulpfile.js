const {
	src,
	dest,
} = require('gulp')
const gulpEsbuild = require('gulp-esbuild')
const gulpReplace = require('gulp-replace')

function build() {
	return src('./src/*.ts')
		.pipe(gulpReplace('GULP_CITY1', 'London'))
		.pipe(gulpReplace('GULP_CITY2', 'New York'))
		.pipe(gulpEsbuild({
			loader: {
				'.ts': 'ts',
			},
		}))
		.pipe(dest('./dist'))
}

exports.build = build
