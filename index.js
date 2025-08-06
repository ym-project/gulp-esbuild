const {Transform} = require('stream')
const {build, context} = require('esbuild')
const PluginError = require('plugin-error')
const Vinyl = require('vinyl')
const {name: PLUGIN_NAME} = require('./package.json')
const resolvePlugin = require('./resolve-plugin')
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

			// What is going on?
			//
			// The problem attaches incrementalBuild. Because of rebuild context creates once,
			// resolvePlugin doesn't receive updated virtual files. We moved variable `entryPoints`
			// to a higher level so the plugin could receive actual files by reference.
			//
			// But now entryPoints doesn't reset its state and stores all files for every rebuilt.
			// This code searches existed files and updates their contents.
			const fileIndex = entryPoints.findIndex((cfile) => cfile.path === file.path)

			if (fileIndex >= 0) {
				entryPoints[fileIndex] = file
			} else {
				entryPoints.push(file)
			}

			cb(null)
		},
		flush: flushFn,
	})
}

function splitOptions(options) {
	const {metafileName, ...esbuildOptions} = options
	return {metafileName, esbuildOptions}
}

//
// handlers
//

function createGulpEsbuild({incremental} = {}) {
	if (incremental) {
		return incrementalBuild()
	}

	return simpleBuild()
}

function simpleBuild() {
	return function plugin(pluginOptions = {}) {
		/** @type Array<import('vinyl').BufferFile> */
		const entryPoints = []
		const {metafileName, esbuildOptions} = splitOptions(pluginOptions)

		async function flushFunction(cb) {
			/** @type import('esbuild').BuildOptions */
			const params = {
				logLevel: 'silent',
				...esbuildOptions,
				entryPoints: entryPoints.map(entry => entry.path),
				write: false,
				plugins: [
					resolvePlugin(entryPoints),
					...(esbuildOptions.plugins || []),
				],
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
				const name = metafileName || metaFileDefaultName

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
	/** @type import('esbuild').BuildContext */
	let ctx
	/** @type Array<import('vinyl').BufferFile> */
	const entryPoints = []

	return function plugin(pluginOptions = {}) {
		const {metafileName, esbuildOptions} = splitOptions(pluginOptions)

		async function flushFunction(cb) {
			/** @type import('esbuild').BuildOptions */
			const params = {
				logLevel: 'silent',
				...esbuildOptions,
				entryPoints: entryPoints.map(entry => entry.path),
				write: false,
				plugins: [
					resolvePlugin(entryPoints),
					...(esbuildOptions.plugins || []),
				],
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
				const name = metafileName || metaFileDefaultName

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

module.exports = createGulpEsbuild()
module.exports.createGulpEsbuild = createGulpEsbuild
