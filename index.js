const { Transform } = require('stream')
const { build } = require('esbuild')
const PluginError = require('plugin-error')
const Vinyl = require('vinyl')

const PLUGIN_NAME = 'gulp-esbuild'
const DEFAULT_OPTIONS = {}

module.exports = function(options = {}) {
    const entries = []

    return new Transform({
        objectMode: true,
        transform(file, _, cb) {
            if (file.isNull()) {
                return
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
                write: false
            }
            let data

            try {
                data = await build(params)
            } catch(err) {
                throw new PluginError(PLUGIN_NAME, err)
            }

            const { outputFiles } = data

            outputFiles.forEach(it => {
                const file = new Vinyl({
                    path:     it.path,
                    contents: Buffer.from(it.contents)
                })

                this.push(file)
            })

            cb(null)
        }
    })
}
