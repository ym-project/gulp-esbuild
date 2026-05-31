const { src, dest } = require('gulp');
const { gulpEsbuild } = require('gulp-esbuild');

function buildUsingDefaultName() {
	return src('./src/*.js')
		.pipe(gulpEsbuild({ entryPoints: ['src/index.js'], metafile: true }))
		.pipe(dest('./dist'));
}

function buildUsingCustomName() {
	return src('./src/*.js')
		.pipe(
			gulpEsbuild({
				entryPoints: ['src/index.js'],
				metafile: true,
				metafileName: 'stats.json',
			}),
		)
		.pipe(dest('./dist'));
}

exports.buildDefaultName = buildUsingDefaultName;
exports.buildCustomName = buildUsingCustomName;
