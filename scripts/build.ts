import type { BuildOptions } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
import { dependencies, devDependencies, peerDependencies } from '../package.json';

const OUTPUT_DIR = path.resolve(process.cwd(), 'dist');

// Exclude all dependencies from the bundle
const external: Set<string> = new Set([
	...Object.keys(dependencies),
	...Object.keys(devDependencies),
	...Object.keys(peerDependencies),
]);

const commonConfig: BuildOptions = {
	entryPoints: [path.resolve(process.cwd(), 'src', 'index.ts')],
	bundle: true,
	platform: 'node',
	target: 'node22',
	loader: { '.ts': 'ts' },
	external: Array.from(external),
};

const buildCjs = () =>
	build({
		...commonConfig,
		outfile: path.join(OUTPUT_DIR, 'plugin.cjs'),
		format: 'cjs',
	});

const buildEsm = () =>
	build({
		...commonConfig,
		outfile: path.join(OUTPUT_DIR, 'plugin.mjs'),
		format: 'esm',
	});

// esbuild does not emit type declarations, so copy the hand-written one.
// The same surface is shipped as .d.ts (ESM) and .d.cts (CJS) so that the
// require condition resolves CommonJS-flavored types instead of masquerading.
const copyTypes = async () => {
	const source = path.resolve(process.cwd(), 'src', 'plugin.d.ts');
	await Promise.all([
		fs.copyFile(source, path.join(OUTPUT_DIR, 'plugin.d.ts')),
		fs.copyFile(source, path.join(OUTPUT_DIR, 'plugin.d.cts')),
	]);
};

await fs.rm(OUTPUT_DIR, { force: true, recursive: true });
await fs.mkdir(OUTPUT_DIR, { recursive: true });
console.log('Output directory cleared');

await Promise.all([
	buildCjs().then(() => console.log('CommonJS build completed')),
	buildEsm().then(() => console.log('ESM build completed')),
	copyTypes().then(() => console.log('Type declarations copied')),
]);
