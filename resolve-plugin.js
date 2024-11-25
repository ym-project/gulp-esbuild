const fs = require('fs/promises')

/**
 * @type {(files: Array<import('vinyl').BufferFile>) => import('esbuild').Plugin}
 * @argument files - gulp's virtual files
 */
const resolvePlugin = (files) => ({
	name: 'resolve-plugin',
	setup(build) {
		async function onResolve(path) {
			const virtualFile = files.find((file) => file.path === path)

			// if there is no virtual file, read file content from file system
			if (virtualFile === undefined) {
				const contents = await fs.readFile(path, 'utf8')
				return {contents}
			}

			// else read virtual file content
			const contents = virtualFile.contents.toString()
			return {contents}
		}

		build.onResolve({filter: /.*/}, ({path, kind}) => {
			// If there is no path in file system, esbuild throws error. To allow to pass virtual
			// files we intercept default behavior and pass to onLoad function.

			if (kind === 'entry-point') {
				return {
					path,
					namespace: 'entryPointResolver',
				}
			}

			return {
				path,
				external: true,
			}
		})

		build.onLoad({filter: /.*/, namespace: 'entryPointResolver'}, ({path}) => {
			return onResolve(path)
		})

		build.onLoad({filter: /.*/}, ({path}) => {
			return onResolve(path)
		})
	},
})

module.exports = resolvePlugin
