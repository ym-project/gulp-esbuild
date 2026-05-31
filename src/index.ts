import type { CreateGulpEsbuildOptions, PluginOptions } from './types';
import type { BuildContext, BuildOptions } from 'esbuild';
import { build, context } from 'esbuild';
import {
	assertEntryPoints,
	createTransformStream,
	createVirtualFile,
	splitPluginOptions,
} from './helpers';
import { resolvePlugin } from './resolvePlugin';

const defaultLogLevel: BuildOptions['logLevel'] = 'silent';
const defaultMetaFileName = 'metafile.json';

const defaultBuild = () => (pluginOptions: PluginOptions) =>
	createTransformStream(async ({ pushChunk, virtualFiles }) => {
		const { metafileName, esbuildOptions } = splitPluginOptions(pluginOptions);
		assertEntryPoints(esbuildOptions.entryPoints);
		const params: BuildOptions = {
			logLevel: defaultLogLevel,
			...esbuildOptions,
			write: false,
			plugins: [resolvePlugin(virtualFiles), ...(esbuildOptions.plugins ?? [])],
		};

		// set outdir by default
		if (!esbuildOptions.outdir && !esbuildOptions.outfile) {
			params.outdir = '.';
		}

		const result = await build(params);

		if (result.outputFiles === undefined) {
			throw new Error('No output files generated');
		}

		for (const outputFile of result.outputFiles) {
			pushChunk(
				createVirtualFile({
					path: outputFile.path,
					contents: Buffer.from(outputFile.contents),
				}),
			);
		}

		if (result.metafile !== undefined) {
			const name = metafileName ?? defaultMetaFileName;

			pushChunk(
				createVirtualFile({
					path: name,
					contents: Buffer.from(JSON.stringify(result.metafile)),
				}),
			);
		}
	});

const incrementalBuild = () => {
	let ctx: BuildContext | undefined;

	return (pluginOptions: PluginOptions) =>
		createTransformStream(async ({ pushChunk, virtualFiles }) => {
			const { metafileName, esbuildOptions } = splitPluginOptions(pluginOptions);
			assertEntryPoints(esbuildOptions.entryPoints);
			const params: BuildOptions = {
				logLevel: defaultLogLevel,
				...esbuildOptions,
				write: false,
				plugins: [resolvePlugin(virtualFiles), ...(esbuildOptions.plugins ?? [])],
			};

			// set outdir by default
			if (!esbuildOptions.outdir && !esbuildOptions.outfile) {
				params.outdir = '.';
			}

			if (ctx === undefined) {
				ctx = await context(params);
			}

			const result = await ctx.rebuild();

			if (result.outputFiles === undefined) {
				throw new Error('No output files generated');
			}

			for (const outputFile of result.outputFiles) {
				pushChunk(
					createVirtualFile({
						path: outputFile.path,
						contents: Buffer.from(outputFile.contents),
					}),
				);
			}

			if (result.metafile !== undefined) {
				const name = metafileName ?? defaultMetaFileName;

				pushChunk(
					createVirtualFile({
						path: name,
						contents: Buffer.from(JSON.stringify(result.metafile)),
					}),
				);
			}
		});
};

export const createGulpEsbuild = ({ incremental = false }: CreateGulpEsbuildOptions = {}) => {
	if (incremental) {
		return incrementalBuild();
	}

	return defaultBuild();
};

export const gulpEsbuild = createGulpEsbuild();
