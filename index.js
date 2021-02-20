const {Transform} = require('stream')
const {build} = require('esbuild')
const PluginError = require('plugin-error')
const Vinyl = require('vinyl')
const {name: PLUGIN_NAME} = require('./package.json')

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

			entryPoints.push(file.path)
			cb(null)
		},
		flush: flushFn,
	})
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
	return function(pluginOptions = {}) {
		const entryPoints = []

		async function flushFunction(cb) {
			const params = {
				logLevel: 'silent',
				...pluginOptions,
				entryPoints,
				write: false,
			}

			// set outdir by default
			if (!pluginOptions.outdir && !pluginOptions.outfile) {
				params.outdir = '.'
			}

			let outputFiles

			try {
				({outputFiles} = await build(params))
			} catch(err) {
				return cb(createError(err))
			}

			outputFiles.forEach(file => {
				this.push(createFile({
					path: file.path,
					contents: Buffer.from(file.contents),
				}))
			})

			cb(null)
		}

		return createTransformStream(flushFunction, entryPoints)
	}
}

function incrementalBuild() {
	let promise

	return function(pluginOptions = {}) {
		const entryPoints = []

		async function flushFunction(cb) {
			const params = {
				logLevel: 'silent',
				...pluginOptions,
				entryPoints,
				write: false,
				incremental: true,
			}

			// set outdir by default
			if (!pluginOptions.outdir && !pluginOptions.outfile) {
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

			cb(null)
		}

		return createTransformStream(flushFunction, entryPoints)
	}
}

function pipedBuild() {
	return function(pluginOptions = {}) {
		const entryPoints = []

		async function flushFunction(cb) {
			const commonParams = {
				logLevel: 'silent',
				...pluginOptions,
				write: false,
			}

			for (const entry of entryPoints) {
				const params = {
					...commonParams,
					outfile: entry.relative.replace(/\.(ts|tsx|jsx)$/, '.js'),
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
					return cb(createError(err))
				}

				outputFiles.forEach(file => {
					this.push(new Vinyl({
						path: file.path,
						contents: Buffer.from(file.contents),
					}))
				})
			}

			cb(null)
		}

		return createTransformStream(flushFunction, entryPoints)
	}
}

function pipedAndIncrementalBuild() {
	let promise

	return function(pluginOptions = {}) {
		const entryPoints = []

		async function flushFunction(cb) {
			const commonParams = {
				logLevel: 'silent',
				...pluginOptions,
				write: false,
			}

			for (const entry of entryPoints) {
				const params = {
					...commonParams,
					outfile: entry.relative.replace(/\.(ts|tsx|jsx)$/, '.js'),
					stdin: {
						contents: entry.contents.toString(),
						resolveDir: entry.dirname,
						loader: entry.extname.slice(1),
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

				cb(null)
			}

			cb(null)
		}

		return createTransformStream(flushFunction, entryPoints)
	}
}


module.exports = createGulpEsbuild()
module.exports.createGulpEsbuild = createGulpEsbuild
