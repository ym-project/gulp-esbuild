/** @type {(options: import('esbuild').BuildOptions) => import('esbuild').TransformOptions} */
const prepareTransformOptions = (options) => {
	const transformOptions = {...options}
	const blackList = [
		'bundle',
		'splitting',
		'preserveSymlinks',
		'outfile',
		'metafile',
		'outdir',
		'outbase',
		'external',
		'packages',
		'alias',
		'loader',
		'resolveExtensions',
		'mainFields',
		'conditions',
		'write',
		'allowOverwrite',
		'tsconfig',
		'outExtension',
		'publicPath',
		'entryNames',
		'chunkNames',
		'assetNames',
		'inject',
		'entryPoints',
		'stdin',
		'plugins',
		'absWorkingDir',
		'nodePaths',
	]

	Object.keys(transformOptions).forEach((key) => {
		if (blackList.includes(key)) {
			delete transformOptions[key]
		}
	})

	return transformOptions
}

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
				const transformOptions = prepareTransformOptions(build.initialOptions)

				const {code, warnings} = await build.esbuild.transform(fileContents, {
					...transformOptions,
					loader,
				})

				return {
					contents: code,
					warnings: warnings,
					loader,
					resolveDir: virtualFile.dirname,
				}
			}

			return null
		}

		build.onLoad({filter: /.*/}, ({path}) => onLoad(path))
	},
})

module.exports = resolvePlugin
