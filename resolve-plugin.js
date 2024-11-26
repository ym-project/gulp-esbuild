/**
 * @type {(files: Array<import('vinyl').BufferFile>) => import('esbuild').Plugin}
 * @argument files - gulp's virtual files
 */
const resolvePlugin = (virtualFiles) => ({
	name: 'resolve-plugin',
	setup(build) {
		async function onLoad(path) {
			const virtualFile = virtualFiles.find((file) => file.path === path)

			if (virtualFile !== undefined) {
				const contents = virtualFile.contents.toString()
				return {contents}
			}

			return null
		}

		build.onLoad({filter: /.*/}, ({path}) => onLoad(path))
	},
})

module.exports = resolvePlugin
