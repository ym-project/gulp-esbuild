import { Readable } from 'node:stream';
import { describe, it, expect } from '@jest/globals';
import Vinyl from 'vinyl';
import { gulpEsbuild, createGulpEsbuild } from '../src';
import { wrapStream } from './helpers';

describe('Given gulp-esbuild', () => {
	it('When createGulpEsbuild is called', () => {
		const fn = createGulpEsbuild();
		expect(fn.name).toBe(gulpEsbuild.name);
	});
});

describe('Given different input types', () => {
	it('When there is no input', async () => {
		expect.assertions(1);
		const stream = gulpEsbuild({ entryPoints: ['file.js'] });
		const promise = wrapStream(stream);

		stream.end();
		await expect(promise).rejects.toThrow('Could not resolve "file.js"');
	});

	it('When got null', async () => {
		expect.assertions(1);
		const stream = gulpEsbuild({ entryPoints: ['file.js'] });
		const promise = wrapStream(stream);

		stream.write(
			new Vinyl({
				path: 'file.js',
			}),
		);
		stream.end();

		await expect(promise).rejects.toThrow('File should be a buffer');
	});

	it('When got a stream', async () => {
		expect.assertions(1);
		const stream = gulpEsbuild({ entryPoints: ['file.js'] });
		const promise = wrapStream(stream);

		stream.write(
			new Vinyl({
				path: 'file.js',
				contents: new Readable(),
			}),
		);

		stream.end();

		await expect(promise).rejects.toThrow('File should be a buffer');
	});
});

describe('Given outdir and outfile options', () => {
	it('When options are not provided', async () => {
		const stream = gulpEsbuild({
			entryPoints: ['file.js'],
		});
		const promise = wrapStream(stream);

		stream.write(
			new Vinyl({
				path: 'file.js',
				contents: Buffer.from(''),
			}),
		);
		stream.end();

		await expect(promise).resolves.toHaveLength(1);
	});

	it('When outdir is provided', async () => {
		const stream = gulpEsbuild({
			entryPoints: ['file.js'],
			outdir: 'dist',
		});
		const promise = wrapStream(stream);

		stream.write(
			new Vinyl({
				path: 'file.js',
				contents: Buffer.from(''),
			}),
		);
		stream.end();

		const files = await promise;
		expect(files.every((file) => file.path.includes('/dist/'))).toBe(true);
	});

	it('When outfile is provided', async () => {
		const stream = gulpEsbuild({
			entryPoints: ['file.js'],
			outfile: 'bundle.js',
		});
		const promise = wrapStream(stream);

		stream.write(
			new Vinyl({
				path: 'file.js',
				contents: Buffer.from(''),
			}),
		);
		stream.end();

		const files = await promise;
		expect(files.length).toBe(1);
		expect(files.every((file) => file.path.includes('bundle.js'))).toBe(true);
	});

	it('When both options are provided', async () => {
		expect.assertions(1);
		const stream = gulpEsbuild({
			entryPoints: ['file.js'],
			outdir: 'dist',
			outfile: 'bundle.js',
		});
		const promise = wrapStream(stream);

		stream.write(
			new Vinyl({
				path: 'file.js',
				contents: Buffer.from(''),
			}),
		);
		stream.end();

		await expect(promise).rejects.toThrow('Cannot use both "outfile" and "outdir"');
	});
});
