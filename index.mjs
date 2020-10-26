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
			let outputFiles

			try {
				({outputFiles} = await build(params))
			} catch(err) {
				return cb(new PluginError(PLUGIN_NAME, err))
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
