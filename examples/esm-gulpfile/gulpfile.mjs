import gulp from 'gulp';
import { gulpEsbuild } from 'gulp-esbuild';

function build() {
	return gulp
		.src('src/index.js')
		.pipe(
			gulpEsbuild({
				entryPoints: ['src/index.js'],
				bundle: true,
				outfile: 'bundle.js',
			}),
		)
		.pipe(gulp.dest('dist'));
}

export { build };
