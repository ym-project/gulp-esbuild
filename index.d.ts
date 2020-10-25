/// <reference types="node" />

import * as stream from 'stream'

type Format = 'iife' | 'cjs' | 'esm'
type Strict = 'nullish-coalescing' | 'optional-chaining' | 'class-fields'
type LogLevel = 'info' | 'warning' | 'error' | 'silent'
type Platform = 'browser' | 'node'
type Loader = 'js' | 'jsx' | 'ts' | 'tsx' | 'css' | 'json' | 'text' | 'base64' | 'file' | 'dataurl' | 'binary'
type Charset = 'ascii' | 'utf8'

interface CommonOptions {
	sourcemap?: boolean | 'inline' | 'external'
	format?: Format
	globalName?: string
	target?: string | string[]
	strict?: boolean | Strict[]

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
	entryPoints?: string[]
}

export = (options: BuildOptions) => stream.Transform
