const { src, dest, watch } = require('gulp');
const { createGulpEsbuild } = require('gulp-esbuild');
const incrementalGulpEsbuild = createGulpEsbuild({ incremental: true });

function devBuild() {
	return src('src/*')
		.pipe(incrementalGulpEsbuild({ entryPoints: ['src/*'] }))
		.pipe(dest('./dist'));
}

function watchTask() {
	watch(['src/*'], devBuild);
}

exports.watch = watchTask;
