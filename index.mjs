import {Transform} from 'stream'
import esbuild from 'esbuild'
import PluginError from 'plugin-error'
import Vinyl from 'vinyl'
import {createRequire} from 'module'

const require = createRequire(import.meta.url)
const {name: PLUGIN_NAME} = require('./package.json')
const {build} = esbuild
const metaFileDefaultName = 'metafile.json'

//
// helpers
//

function createFile(file) {
	return new Vinyl(file)
}

function createError(err) {
	return new PluginError(PLUGIN_NAME, err, {showProperties: false})
}

function createTransformStream(flushFn, entryPoints) {
	return new Transform({
		objectMode: true,
		transform(file, _, cb) {
			if (!file.isBuffer()) {
				return cb(createError(new TypeError('File should be a buffer')))
			}

			entryPoints.push(file)
			cb(null)
		},
		flush: flushFn,
	})
}

function omitPluginSpecialOptions(options) {
	return omit(options, [
		'metafileName',
	])
}

function omit(object, keys = []) {
	const obj = {}

	for (const key in object) {
		const value = object[key]

		if (keys.includes(key)) {
			continue
		}

		obj[key] = value
	}

	return obj
}

//
// handlers
//

function createGulpEsbuild(createOptions = {}) {
	const {
		pipe,
		incremental,
	} = createOptions

	if (incremental) {
		if (pipe) {
			return pipedAndIncrementalBuild()
		}

		return incrementalBuild()
	}

	if (pipe) {
		return pipedBuild()
	}

	return simpleBuild()
}

function simpleBuild() {
	return function plugin(pluginOptions = {}) {
		const entryPoints = []
		const esbuildOptions = omitPluginSpecialOptions(pluginOptions)
		const specialOptions = {
			metafileName: pluginOptions.metafileName,
		}

		async function flushFunction(cb) {
			const params = {
				logLevel: 'silent',
				...esbuildOptions,
				entryPoints: entryPoints.map(entry => entry.path),
				write: false,
			}

			// set outdir by default
			if (!esbuildOptions.outdir && !esbuildOptions.outfile) {
				params.outdir = '.'
			}

			let result

			try {
				result = await build(params)
			} catch(err) {
				return cb(createError(err))
			}

			result.outputFiles.forEach(file => {
				this.push(createFile({
					path: file.path,
					contents: Buffer.from(file.contents),
				}))
			})

			if (result.metafile) {
				const name = specialOptions.metafileName || metaFileDefaultName

				this.push(createFile({
					path: name,
					contents: Buffer.from(JSON.stringify(result.metafile)),
				}))
			}

			cb(null)
		}

		return createTransformStream(flushFunction, entryPoints)
	}
}

function incrementalBuild() {
	let promise

	return function plugin(pluginOptions = {}) {
		const entryPoints = []
		const esbuildOptions = omitPluginSpecialOptions(pluginOptions)
		const specialOptions = {
			metafileName: pluginOptions.metafileName,
		}

		async function flushFunction(cb) {
			const params = {
				logLevel: 'silent',
				...esbuildOptions,
				entryPoints: entryPoints.map(entry => entry.path),
				write: false,
				incremental: true,
			}

			// set outdir by default
			if (!esbuildOptions.outdir && !esbuildOptions.outfile) {
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
				return cb(createError(err))
			}

			promise.outputFiles.forEach(file => {
				this.push(createFile({
					path: file.path,
					contents: Buffer.from(file.contents),
				}))
			})

			if (promise.metafile) {
				const name = specialOptions.metafileName || metaFileDefaultName

				this.push(createFile({
					path: name,
					contents: Buffer.from(JSON.stringify(promise.metafile)),
				}))
			}

			cb(null)
		}

		return createTransformStream(flushFunction, entryPoints)
	}
}

function pipedBuild() {
	return function plugin(pluginOptions = {}) {
		const entryPoints = []
		const esbuildOptions = omitPluginSpecialOptions(pluginOptions)
		const specialOptions = {
			metafileName: pluginOptions.metafileName,
		}

		async function flushFunction(cb) {
			const commonParams = {
				logLevel: 'silent',
				...esbuildOptions,
				write: false,
			}

			for (const entry of entryPoints) {
				const customLoader = esbuildOptions.loader && esbuildOptions.loader[entry.extname]
				const loader = customLoader || entry.extname.slice(1)
				const params = {
					...commonParams,
					outfile: entry.relative.replace(/\.(ts|tsx|jsx)$/, '.js'),
					stdin: {
						contents: entry.contents.toString(),
						resolveDir: entry.dirname,
						loader,
						sourcefile: entry.path,
					},
				}

				let result

				try {
					result = await build(params)
				} catch(err) {
					return cb(createError(err))
				}

				result.outputFiles.forEach(file => {
					this.push(createFile({
						path: file.path,
						contents: Buffer.from(file.contents),
					}))
				})

				if (result.metafile) {
					const name = specialOptions.metafileName || metaFileDefaultName

					this.push(createFile({
						path: name,
						contents: Buffer.from(JSON.stringify(result.metafile)),
					}))
				}

			}

			cb(null)
		}

		return createTransformStream(flushFunction, entryPoints)
	}
}

function pipedAndIncrementalBuild() {
	let promise

	return function plugin(pluginOptions = {}) {
		const entryPoints = []
		const esbuildOptions = omitPluginSpecialOptions(pluginOptions)
		const specialOptions = {
			metafileName: pluginOptions.metafileName,
		}

		async function flushFunction(cb) {
			const commonParams = {
				logLevel: 'silent',
				...esbuildOptions,
				write: false,
			}

			for (const entry of entryPoints) {
				const customLoader = esbuildOptions.loader && esbuildOptions.loader[entry.extname]
				const loader = customLoader || entry.extname.slice(1)
				const params = {
					...commonParams,
					outfile: entry.relative.replace(/\.(ts|tsx|jsx)$/, '.js'),
					stdin: {
						contents: entry.contents.toString(),
						resolveDir: entry.dirname,
						loader,
						sourcefile: entry.path,
					},
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
					return cb(createError(err))
				}

				promise.outputFiles.forEach(file => {
					this.push(createFile({
						path: file.path,
						contents: Buffer.from(file.contents),
					}))
				})

				if (promise.metafile) {
					const name = specialOptions.metafileName || metaFileDefaultName

					this.push(createFile({
						path: name,
						contents: Buffer.from(JSON.stringify(promise.metafile)),
					}))
				}

				cb(null)
			}

			cb(null)
		}

		return createTransformStream(flushFunction, entryPoints)
	}
}

export default createGulpEsbuild()
export {createGulpEsbuild}
