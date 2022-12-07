import {Transform} from 'stream'
import {BuildOptions} from 'esbuild'

declare namespace gulpEsbuild {
	type Options = Omit<
		BuildOptions,
		'write' | 'incremental' | 'entryPoints' | 'stdin' | 'watch' | 'allowOverwrite' | 'absWorkingDir' | 'nodePaths'
	> & {
		metafileName?: string
	}

	interface CreateOptions {
		incremental?: boolean
		pipe?: boolean
	}
	
	type GulpEsbuild = (options: Options) => Transform
	type CreateGulpEsbuild = (options: CreateOptions) => GulpEsbuild
}

declare const gulpEsbuild: gulpEsbuild.GulpEsbuild & {
	createGulpEsbuild: gulpEsbuild.CreateGulpEsbuild
}

export = gulpEsbuild
