import type { Loader, Plugin } from 'esbuild';
import type { BufferFile } from 'vinyl';
import nodePath from 'node:path';

const NAMESPACE = 'gulp-virtual-file';

export const resolvePlugin = (virtualFiles: Array<BufferFile>): Plugin => ({
	name: 'gulp-esbuild-resolve-plugin',
	setup(build) {
		const fileMap = new Map(
			virtualFiles.map((file) => [
				nodePath.resolve(file.cwd || process.cwd(), file.path),
				file,
			]),
		);

		const findVirtualFileKey = (path: string) => {
			if (fileMap.has(path)) {
				return path;
			}

			// Esbuild default behavior
			return undefined;
		};

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

			const customLoader =
				build.initialOptions.loader && build.initialOptions.loader[virtualFile.extname];
			const loader = customLoader || (virtualFile.extname.slice(1) as Loader);

			return {
				contents: virtualFile.contents.toString(),
				resolveDir: nodePath.dirname(path),
				loader,
			};
		});
	},
});
