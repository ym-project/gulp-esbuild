import path from 'node:path';
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

describe('Given metafile option', () => {
	it('When metafile is true', async () => {
		const stream = gulpEsbuild({
			entryPoints: ['file.js'],
			metafile: true,
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

		expect(files.length).toBe(2);
		expect(files[0].path).toContain('file.js');
		expect(files[1].path).toBe('metafile.json');
	});

	it('When metafileName is provided', async () => {
		const stream = gulpEsbuild({
			entryPoints: ['file.js'],
			metafile: true,
			metafileName: 'meta.json',
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

		expect(files.length).toBe(2);
		expect(files[0].path).toContain('file.js');
		expect(files[1].path).toBe('meta.json');
	});
});

describe('Given resolve options', () => {
	it('When resolveExtensions is not provided', async () => {
		const stream = gulpEsbuild({
			entryPoints: ['entry.js'],
			bundle: true,
		});
		const promise = wrapStream(stream);

		stream.write(new Vinyl({ path: 'a.tsx', contents: Buffer.from('') }));
		stream.write(new Vinyl({ path: 'b.ts', contents: Buffer.from('') }));
		stream.write(new Vinyl({ path: 'c.jsx', contents: Buffer.from('') }));
		stream.write(new Vinyl({ path: 'd.js', contents: Buffer.from('') }));
		stream.write(new Vinyl({ path: 'e.css', contents: Buffer.from('') }));
		stream.write(new Vinyl({ path: 'f.json', contents: Buffer.from('{}') }));
		stream.write(
			new Vinyl({
				path: 'entry.js',
				contents: Buffer.from(
					'import "./a";\n' +
						'import "./b";\n' +
						'import "./c";\n' +
						'import "./d";\n' +
						'import "./e";\n' +
						'import "./f";\n',
				),
			}),
		);
		stream.end();

		await expect(promise).resolves.toBeDefined();
	});

	it('When resolveExtensions is not provided and unresolved extension is used', async () => {
		expect.assertions(1);
		const stream = gulpEsbuild({
			entryPoints: ['entry.js'],
			bundle: true,
		});
		const promise = wrapStream(stream);

		stream.write(new Vinyl({ path: 'a.unknown', contents: Buffer.from('') }));
		stream.write(
			new Vinyl({
				path: 'entry.js',
				contents: Buffer.from('import "./a";'),
			}),
		);
		stream.end();

		await expect(promise).rejects.toThrow('Could not resolve "./a"');
	});

	it('When resolveExtensions is provided', async () => {
		const stream = gulpEsbuild({
			entryPoints: ['entry.js'],
			resolveExtensions: ['.js', '.jsx'],
			bundle: true,
		});
		const promise = wrapStream(stream);

		stream.write(
			new Vinyl({
				path: 'entry.js',
				contents: Buffer.from('import "./file";'),
			}),
		);
		stream.write(
			new Vinyl({
				path: 'file.jsx',
				contents: Buffer.from('console.log("hello");'),
			}),
		);
		stream.end();

		await expect(promise).resolves.toBeDefined();
	});

	it('When resolveExtensions is provided and unresolved extension is used', async () => {
		expect.assertions(1);
		const stream = gulpEsbuild({
			entryPoints: ['entry.js'],
			resolveExtensions: ['.js'],
			bundle: true,
		});
		const promise = wrapStream(stream);

		stream.write(
			new Vinyl({
				path: 'entry.js',
				contents: Buffer.from('import "./a";'),
			}),
		);
		stream.write(
			new Vinyl({
				path: 'a.jsx',
				contents: Buffer.from(''),
			}),
		);
		stream.end();

		await expect(promise).rejects.toThrow('Could not resolve "./a"');
	});
});

describe('Given build process', () => {
	it('When all virtual files passed', async () => {
		const stream = gulpEsbuild({
			entryPoints: ['entry.js'],
			bundle: true,
		});
		const promise = wrapStream(stream);

		stream.write(
			new Vinyl({
				path: 'entry.js',
				contents: Buffer.from('import "./file.js";'),
			}),
		);
		stream.write(
			new Vinyl({
				path: 'file.js',
				contents: Buffer.from('console.log("Hello, world!");'),
			}),
		);
		stream.end();

		const files = await promise;

		expect(files.length).toBe(1);
		expect(files[0].path).toContain('entry.js');
		expect(files[0].contents?.toString()).toContain('console.log("Hello, world!");');
	});

	it('When one of files is on the disk', async () => {
		const stream = gulpEsbuild({
			entryPoints: ['./tests/entry.js'],
			bundle: true,
			loader: {
				'.ts': 'ts',
			},
		});
		const promise = wrapStream(stream);

		stream.write(
			new Vinyl({
				path: path.resolve(process.cwd(), 'tests', 'entry.js'),
				contents: Buffer.from('import {hello} from "./fixtures/file.ts";\nhello();'),
			}),
		);
		stream.end();

		const files = await promise;

		expect(files.length).toBe(1);
		expect(files[0].path).toContain('entry.js');
		expect(files[0].contents?.toString()).toContain('console.log("Hello, world!");');
	});
});

describe('Given loader options', () => {
	it('When loader is not provided', async () => {
		const stream = gulpEsbuild({
			entryPoints: ['entry.js'],
			bundle: true,
		});
		const promise = wrapStream(stream);

		stream.write(
			new Vinyl({
				path: 'entry.js',
				contents: Buffer.from(''),
			}),
		);
		stream.end();

		await expect(promise).resolves.toBeDefined();
	});

	it('When loader is not provided and file extension is unknown', async () => {
		expect.assertions(1);
		const stream = gulpEsbuild({
			entryPoints: ['entry.abc'],
			bundle: true,
		});
		const promise = wrapStream(stream);

		stream.write(
			new Vinyl({
				path: 'entry.abc',
				contents: Buffer.from(''),
			}),
		);
		stream.end();

		await expect(promise).rejects.toThrow('No loader configured for file: entry.abc');
	});

	it('When loader is provided', async () => {
		const stream = gulpEsbuild({
			entryPoints: ['entry.abc'],
			bundle: true,
			loader: {
				'.abc': 'text',
			},
		});
		const promise = wrapStream(stream);

		stream.write(
			new Vinyl({
				path: 'entry.abc',
				contents: Buffer.from(''),
			}),
		);
		stream.end();

		await expect(promise).resolves.toBeDefined();
	});

	it('When loader is not provided and file extension is .module.css', async () => {
		const stream = gulpEsbuild({
			entryPoints: ['entry.js'],
			bundle: true,
		});
		const promise = wrapStream(stream);

		stream.write(
			new Vinyl({
				path: 'entry.js',
				contents: Buffer.from('import css from "./file.module.css"; console.log(css.a)'),
			}),
		);
		stream.write(
			new Vinyl({
				path: 'file.module.css',
				contents: Buffer.from('.a { color: red; }'),
			}),
		);
		stream.end();

		const files = await promise;

		expect(files.length).toBe(2);
		expect(files[0].path).toContain('entry.js');
		expect(files[1].path).toContain('entry.css');
		// Css class was renamed to file_a. It means that css-local loader works
		expect(files[0].contents?.toString()).toContain('file_a');
		expect(files[1].contents?.toString()).toContain('.file_a');
	});

	it('When loader is not provided and file extension is .css', async () => {
		const stream = gulpEsbuild({
			entryPoints: ['entry.js'],
			bundle: true,
		});
		const promise = wrapStream(stream);

		stream.write(
			new Vinyl({
				path: 'entry.js',
				contents: Buffer.from('import css from "./file.css"; console.log(css.a)'),
			}),
		);
		stream.write(
			new Vinyl({
				path: 'file.css',
				contents: Buffer.from('.a { color: red; }'),
			}),
		);
		stream.end();

		const files = await promise;

		console.log(files[0].contents?.toString());
		console.log(files[1].contents?.toString());

		expect(files.length).toBe(2);
		expect(files[0].path).toContain('entry.js');
		expect(files[1].path).toContain('entry.css');
		// Css class was not renamed to file_a. It means that css loader works
		expect(files[0].contents?.toString()).not.toContain('file_a');
		expect(files[1].contents?.toString()).toContain('.a');
	});
});
