import {Transform} from 'stream'
import {BuildOptions} from 'esbuild'

type Options = Omit<
    BuildOptions,
    'write' | 'incremental' | 'entryPoints' | 'stdin' | 'watch'
>

interface CreateOptions {
    incremental?: boolean
    pipe?: boolean
}

type GulpEsbuild = (options: Options) => Transform
type CreateGulpEsbuild = (options: CreateOptions) => GulpEsbuild

declare const gulpEsbuild: GulpEsbuild & {
    createGulpEsbuild: CreateGulpEsbuild
}

export = gulpEsbuild
