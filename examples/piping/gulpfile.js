const {
	src,
	dest,
} = require('gulp')
const {stdinGulpEsbuild} = require('gulp-esbuild')
const ts = require('gulp-typescript')
const alias = require('gulp-ts-alias').default

const tsProject = ts.createProject('./tsconfig.json')

function build() {
	return (
		tsProject
			.src()
			// @ts-ignore
			.pipe(alias({ configuration: tsProject.config }))
			.pipe(
				stdinGulpEsbuild({
					platform: 'node',
				}),
			)
			.pipe(dest(tsProject.config.compilerOptions.outDir))
	)
}

exports.build = build
