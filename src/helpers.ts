import type { PluginOptions } from './types';
import type { BuildOptions } from 'esbuild';
import { Transform } from 'node:stream';
import PluginError from 'plugin-error';
import Vinyl, { BufferFile } from 'vinyl';
import { name as PLUGIN_NAME } from '../package.json';

type VinylOptions = ConstructorParameters<typeof Vinyl>[0];

export const createVirtualFile = (file: VinylOptions) => new Vinyl(file);

export const createPluginError = (err: Error) =>
	new PluginError(PLUGIN_NAME, err, { showProperties: false });

/** Split options to plugin-specific and esbuild options */
export const splitPluginOptions = ({ metafileName, ...esbuildOptions }: PluginOptions) => ({
	metafileName,
	esbuildOptions,
});

/** Ensure the user provided at least one entry point */
export const assertEntryPoints = (entryPoints: BuildOptions['entryPoints']) => {
	const isEmpty =
		entryPoints === undefined ||
		(Array.isArray(entryPoints)
			? entryPoints.length === 0
			: Object.keys(entryPoints).length === 0);

	if (isEmpty) {
		throw new TypeError('"entryPoints" option is required and must not be empty');
	}
};

type CreateTransformStreamCallbackOptions = {
	pushChunk: Transform['push'];
	virtualFiles: Array<BufferFile>;
};

type CreateTransformStreamCallback = (
	options: CreateTransformStreamCallbackOptions,
) => Promise<void>;

export const createTransformStream = (callback: CreateTransformStreamCallback) => {
	const virtualFiles: Array<BufferFile> = [];

	return new Transform({
		objectMode: true,
		transform(file, _encoding, cb) {
			const vinylFile = file as Vinyl;

			if (!vinylFile.isBuffer()) {
				return cb(createPluginError(new TypeError('File should be a buffer')));
			}

			virtualFiles.push(vinylFile);
			cb(null);
		},
		async flush(cb) {
			const pushChunk = this.push.bind(this);

			try {
				await callback({ pushChunk, virtualFiles });
			} catch (err) {
				return cb(createPluginError(err as Error));
			}

			cb(null);
		},
	});
};
