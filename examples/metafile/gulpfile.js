const {
	src,
	dest,
} = require('gulp')
const gulpEsbuild = require('gulp-esbuild')

// You didn't set a metafile name. Name of this file will be set by default.
// Default name is "metafile.json"
function buildWithDefaultMetaFileName() {
	return src('./src/*.js')
		.pipe(gulpEsbuild({
			metafile: true,
		}))
		.pipe(dest('./dist'))
}

// You can set name of metafile. Pass "metafileName" option to rename metafile as you want.
function buildWithCertainMetaFileName() {
	return src('./src/*.js')
		.pipe(gulpEsbuild({
			metafile: true,
			metafileName: 'stats.json',
		}))
		.pipe(dest('./dist'))
}

exports['build-default-meta'] = buildWithDefaultMetaFileName
exports['build-named-meta'] = buildWithCertainMetaFileName
