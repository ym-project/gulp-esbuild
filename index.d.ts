/// <reference types="node" />

import * as stream from 'stream'

type Format = 'iife' | 'cjs' | 'esm'
type LogLevel = 'info' | 'warning' | 'error' | 'silent'
type Platform = 'browser' | 'node'
type Loader = 'js' | 'jsx' | 'ts' | 'tsx' | 'css' | 'json' | 'text' | 'base64' | 'file' | 'dataurl' | 'binary' | 'default'
type Charset = 'ascii' | 'utf8'

interface CommonOptions {
	sourcemap?: boolean | 'inline' | 'external'
	format?: Format
	globalName?: string
	target?: string | string[]

	minify?: boolean
	minifyWhitespace?: boolean
	minifyIdentifiers?: boolean
	minifySyntax?: boolean
	charset?: Charset

	jsxFactory?: string
	jsxFragment?: string
	define?: {
		[key: string]: string
	}
	pure?: string[]
	avoidTDZ?: boolean
	keepNames?: boolean

	color?: boolean
	logLevel?: LogLevel
	errorLimit?: number
}

interface BuildOptions extends CommonOptions {
	bundle?: boolean
	splitting?: boolean
	outfile?: string
	metafile?: string
	outdir?: string
	outbase?: string
	platform?: Platform
	external?: string[]
	loader?: {
		[ext: string]: Loader
	}
	resolveExtensions?: string[]
	mainFields?: string[]
	tsconfig?: string
	outExtension?: {
		[ext: string]: string
	}
	publicPath?: string
	inject?: string[]
	plugins?: Plugin[]
}

interface Plugin {
	name: string
	setup: (build: PluginBuild) => void
}

interface PluginBuild {
	onResolve(options: OnResolveOptions, callback: (args: OnResolveArgs) =>
		(OnResolveResult | null | undefined | Promise<OnResolveResult | null | undefined>)): void
	onLoad(options: OnLoadOptions, callback: (args: OnLoadArgs) =>
		(OnLoadResult | null | undefined | Promise<OnLoadResult | null | undefined>)): void
}

interface OnResolveOptions {
	filter: RegExp
	namespace?: string
}

interface OnResolveArgs {
	path: string
	importer: string
	namespace: string
	resolveDir: string
}

interface OnResolveResult {
	pluginName?: string

	errors?: PartialMessage[]
	warnings?: PartialMessage[]

	path?: string
	external?: boolean
	namespace?: string
}

interface OnLoadOptions {
	filter: RegExp
	namespace?: string
}

interface OnLoadArgs {
	path: string
	namespace: string
}

interface OnLoadResult {
	pluginName?: string

	errors?: PartialMessage[]
	warnings?: PartialMessage[]

	contents?: string | Uint8Array
	resolveDir?: string
	loader?: Loader
}

interface PartialMessage {
	text?: string
	location?: Partial<Location> | null
}

interface Location {
	file: string
	namespace: string
	line: number
	column: number
	length: number
	lineText: string
}

declare const gulpEsbuild: (options: BuildOptions) => stream.Transform
export = gulpEsbuild
