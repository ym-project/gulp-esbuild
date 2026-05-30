import type { BuildOptions } from 'esbuild';
import type { Transform } from 'node:stream';

export type CreateGulpEsbuildOptions = {
	/** Enables incremental build */
	incremental?: boolean;
};

export type PluginOptions =
	& Omit<BuildOptions, 'write' | 'incremental' | 'stdin' | 'watch'>
	& Required<Pick<BuildOptions, 'entryPoints'>>
	& {
		/** Metafile name */
		metafileName?: string;
	};

export declare const createGulpEsbuild: (
	options?: CreateGulpEsbuildOptions,
) => (pluginOptions: PluginOptions) => Transform;

export declare const gulpEsbuild: (pluginOptions: PluginOptions) => Transform;
