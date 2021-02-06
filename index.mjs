import {Transform} from 'stream'
import esbuild from 'esbuild'
import PluginError from 'plugin-error'
import Vinyl from 'vinyl'
import {createRequire} from 'module'

const require = createRequire(import.meta.url)
const {name: PLUGIN_NAME} = require('./package.json')
const {build} = esbuild

export default function(options = {}) {
	const entryPoints = []

	return new Transform({
		objectMode: true,
		transform(file, _, cb) {
			if (!file.isBuffer()) {
				return cb(new PluginError(PLUGIN_NAME, new TypeError('file should be a buffer')))
			}

			entryPoints.push(file.path)
			cb(null)
		},
		async flush(cb) {
			const params = {
				logLevel: 'silent',
				...options,
				entryPoints,
				write: false,
			}

			// set outdir by default
			if (!options.outdir && !options.outfile) {
				params.outdir = '.'
			}

			let outputFiles

			try {
				({outputFiles} = await build(params))
			} catch(err) {
				return cb(new PluginError(PLUGIN_NAME, err, {
					showProperties: false,
				}))
			}

			outputFiles.forEach(file => {
				this.push(new Vinyl({
					path: file.path,
					contents: Buffer.from(file.contents),
				}))
			})

			cb(null)
		},
	})
}

export function createGulpEsbuild() {
	let promise

	return function(options = {}) {
		const entryPoints = []

		return new Transform({
			objectMode: true,
			transform(file, _, cb) {
				if (!file.isBuffer()) {
					return cb(new PluginError(PLUGIN_NAME, new TypeError('file should be a buffer')))
				}

				entryPoints.push(file.path)
				cb(null)
			},
			async flush(cb) {
				const params = {
					logLevel: 'silent',
					...options,
					entryPoints,
					write: false,
					incremental: true,
				}

				// set outdir by default
				if (!options.outdir && !options.outfile) {
					params.outdir = '.'
				}

				try {
					// if it's the first build
					if (!promise) {
						promise = await build(params)
					}
					// if it's > 1 build
					else {
						promise = await promise.rebuild()
					}
				} catch(err) {
					return cb(new PluginError(PLUGIN_NAME, err, {
						showProperties: false,
					}))
				}

				promise.outputFiles.forEach(file => {
					this.push(new Vinyl({
						path: file.path,
						contents: Buffer.from(file.contents),
					}))
				})

				cb(null)
			},
		})
	}
}

export function pipedGulpEsbuild(options = {}) {
	const entries = []

	return new Transform({
		objectMode: true,
		transform(file, _, cb) {
			if (!file.isBuffer()) {
				return cb(new PluginError(PLUGIN_NAME, new TypeError('file should be a buffer')))
			}

			entries.push(file)
			cb(null)
		},
		async flush(cb) {
			const commonParams = {
				logLevel: 'silent',
				...options,
				write: false,
			}

			for (const entry of entries) {
				const params = {
					...commonParams,
					outfile: entry.relative.replace(/.(ts|tsx|jsx)$/, '.js'),
					stdin: {
						contents: entry.contents.toString(),
						resolveDir: entry.dirname,
						loader: entry.extname.slice(1),
						sourcefile: entry.path,
					},
				}

				let outputFiles

				try {
					({outputFiles} = await build(params))
				} catch(err) {
					return cb(new PluginError(PLUGIN_NAME, err, {
						showProperties: false,
					}))
				}

				outputFiles.forEach(file => {
					this.push(new Vinyl({
						path: file.path,
						contents: Buffer.from(file.contents),
					}))
				})
			}

			cb(null)
		},
	})
}
