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
				const fileContents = virtualFile.contents.toString()
				const customLoader = build.initialOptions.loader && build.initialOptions.loader[virtualFile.extname]
				const loader = customLoader || virtualFile.extname.slice(1)

				return {
					contents: fileContents,
					resolveDir: virtualFile.dirname,
					loader,
				}
			}

			return null
		}

		build.onLoad({filter: /.*/}, ({path}) => onLoad(path))
	},
})

module.exports = resolvePlugin
