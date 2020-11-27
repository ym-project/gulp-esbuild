import {Transform} from 'stream'
import {BuildOptions} from 'esbuild'

type Options = Omit<
	BuildOptions,
	'write' | 'incremental' | 'entryPoints' | 'stdin'
>

type GulpEsbuild = (options: Options) => Transform
type CreateGulpEsbuild = () => GulpEsbuild

declare const gulpEsbuild: GulpEsbuild & {
	createGulpEsbuild: CreateGulpEsbuild
}

export = gulpEsbuild
