const fs = require('fs/promises')

/**
 * @type {(files: Array<import('vinyl').BufferFile>) => import('esbuild').Plugin}
 * @argument files - gulp's virtual files
 */
const resolvePlugin = (files) => ({
	name: 'resolve-plugin',
	setup(build) {
		build.onLoad({filter: /.*/}, async ({path}) => {
			const virtualFile = files.find((file) => file.path === path)

			// if there is no virtual file, read file content from file system
			if (virtualFile === undefined) {
				const contents = await fs.readFile(path, 'utf8')
				return {contents}
			}

			// else read virtual file content
			const contents = virtualFile.contents.toString()
			return {contents}
		})
	},
})

module.exports = resolvePlugin
