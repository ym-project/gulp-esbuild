import {Transform} from 'stream'
import esbuild from 'esbuild'
import PluginError from 'plugin-error'
import Vinyl from 'vinyl'

const {build} = esbuild

export default function(options = {}) {
	const entries = []

	return new Transform({
		objectMode: true,
		transform(file, _, cb) {
			if (!file.isBuffer()) {
				return cb(new PluginError(PLUGIN_NAME, new TypeError('file should be a buffer')))
			}

			if (!options.entryPoints) {
				const path = file.history[file.history.length - 1]
				entries.push(path)
			}

			cb(null)
		},
		async flush(cb) {
			const entry = options.entryPoints || entries
			const params = {
				...options,
				entryPoints: entry,
				write: false,
			}
			let data

			try {
				data = await build(params)
			} catch(err) {
				return cb(new PluginError(PLUGIN_NAME, err))
			}

			const {outputFiles} = data

			outputFiles.forEach(it => {
				const file = new Vinyl({
					path: it.path,
					contents: Buffer.from(it.contents),
				})

				this.push(file)
			})

			cb(null)
		},
	})
}
