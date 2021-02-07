const {
	src,
	dest,
} = require('gulp')
const {pipedGulpEsbuild} = require('gulp-esbuild')
const ts = require('gulp-typescript')
const alias = require('gulp-ts-alias').default

const tsProject = ts.createProject('./tsconfig.json')

function build() {
	return (
		tsProject.src()
			.pipe(alias({
				configuration: tsProject.config,
			}))
			.pipe(pipedGulpEsbuild({
				platform: 'node',
			}))
			.pipe(dest(tsProject.config.compilerOptions.outDir))
	)
}

exports.build = build
