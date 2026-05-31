import type { BuildOptions } from 'esbuild';

export type CreateGulpEsbuildOptions = {
	/** Enables incremental build*/
	incremental?: boolean;
};

export type PluginOptions = Omit<
	BuildOptions,
	'write' | 'stdin' | 'absWorkingDir' | 'allowOverwrite'
> &
	Required<Pick<BuildOptions, 'entryPoints'>> & {
		/** Metafile name */
		metafileName?: string;
	};
