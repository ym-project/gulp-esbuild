import {Transform} from 'stream'
import {BuildOptions} from 'esbuild'

type Options = Omit<
	BuildOptions,
	'write' | 'incremental' | 'entryPoints' | 'stdin'
>

declare const gulpEsbuild: (options: Options) => Transform
export = gulpEsbuild
