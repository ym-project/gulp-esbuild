import type { Loader, Plugin } from 'esbuild';
import type { BufferFile } from 'vinyl';
import nodePath from 'node:path';

const PLUGIN_NAME = 'gulp-esbuild-resolve-plugin';
const NAMESPACE = 'gulp-virtual-file';
// Esbuild's default resolve extensions
const DEFAULT_RESOLVE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.css', '.json'];

// Esbuild's default loader mapping based on file extensions
const LOADERS_MAPPING: Record<string, Loader> = {
	// Javascript
	'.js': 'js',
	'.cjs': 'js',
	'.mjs': 'js',
	// Typescript
	'.ts': 'ts',
	'.cts': 'ts',
	'.mts': 'ts',
	// JSX
	'.jsx': 'jsx',
	'.tsx': 'tsx',
	// Json
	'.json': 'json',
	// CSS
	'.css': 'css',
	'.module.css': 'local-css',
	// Text
	'.txt': 'text',
};

export const resolvePlugin = (virtualFiles: Array<BufferFile>): Plugin => ({
	name: PLUGIN_NAME,
	setup(build) {
		const fileMap = new Map(
			virtualFiles.map((file) => [
				nodePath.resolve(file.cwd || process.cwd(), file.path),
				file,
			]),
		);
		const resolveExtensions =
			build.initialOptions.resolveExtensions ?? DEFAULT_RESOLVE_EXTENSIONS;
		const userLoaders = build.initialOptions.loader ?? {};

		const findVirtualFileKey = (path: string) => {
			if (fileMap.has(path)) {
				return path;
			}

			// Check files without extensions
			for (const extension of resolveExtensions) {
				const candidate = `${path}${extension}`;

				if (fileMap.has(candidate)) {
					return candidate;
				}
			}

			// Esbuild default behavior
			return undefined;
		};

		// Find the most specific loader key based on the file extension
		// .module.css should be matched before .css
		const resolveLoaderKey = (filePath: string, keys: Array<string>): string | undefined =>
			keys
				.filter((extension) => filePath.endsWith(extension))
				.sort((a, b) => b.length - a.length)
				.at(0);

		build.onResolve({ filter: /.*/ }, ({ resolveDir, path }) => {
			const absolutePath = nodePath.resolve(resolveDir, path);
			const key = findVirtualFileKey(absolutePath);

			if (key !== undefined) {
				return {
					path: key,
					namespace: NAMESPACE,
				};
			}

			// Esbuild default behavior
			return undefined;
		});

		build.onLoad({ filter: /.*/, namespace: NAMESPACE }, ({ path }) => {
			const virtualFile = fileMap.get(path);

			if (virtualFile === undefined) {
				return null;
			}

			const name = nodePath.basename(virtualFile.path);

			const userKey = resolveLoaderKey(name, Object.keys(userLoaders));
			const mapKey = resolveLoaderKey(name, Object.keys(LOADERS_MAPPING));

			let loader: Loader | undefined;

			if (userKey !== undefined) {
				loader = userLoaders[userKey];
			}

			if (loader === undefined && mapKey !== undefined) {
				loader = LOADERS_MAPPING[mapKey];
			}

			if (loader === undefined) {
				throw new Error(`No loader configured for file: ${name}`);
			}

			return {
				contents: virtualFile.contents.toString(),
				resolveDir: nodePath.dirname(path),
				loader,
			};
		});
	},
});
