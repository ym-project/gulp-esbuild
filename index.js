const {Transform} = require('stream')
const {build, context} = require('esbuild')
const PluginError = require('plugin-error')
const Vinyl = require('vinyl')
const {name: PLUGIN_NAME} = require('./package.json')
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
	let ctx

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
				// if it's the first build
				if (!ctx) {
					ctx = await context(params)
				}
				
				result = await ctx.rebuild()
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
				const outfile = esbuildOptions.outfile || entry.relative.replace(/\.(cts|mts|ts|tsx|jsx)$/, '.js')

				const params = {
					...commonParams,
					outfile,
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
	let ctx

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
				const outfile = esbuildOptions.outfile || entry.relative.replace(/\.(cts|mts|ts|tsx|jsx)$/, '.js')

				const params = {
					...commonParams,
					outfile,
					stdin: {
						contents: entry.contents.toString(),
						resolveDir: entry.dirname,
						loader,
						sourcefile: entry.path,
					},
				}

				let result

				try {
					// if it's the first build
					if (!ctx) {
						ctx = await context(params)
					}
					
					result = await ctx.rebuild()
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


module.exports = createGulpEsbuild()
module.exports.createGulpEsbuild = createGulpEsbuild
