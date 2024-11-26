const gulpEsbuild = require('..')
const {createGulpEsbuild} = require('..')
const {Readable} = require('stream')
const Vinyl = require('vinyl')
const path = require('path')

//
// helpers
//

function wrapStream(stream) {
	return new Promise((resolve, reject) => {
		const chunks = []

		stream.on('data', chunk => chunks.push(chunk))
		stream.on('error', reject)
		stream.on('end', () => resolve(chunks))
	})
}

function resolve(filePath) {
	return path.resolve(__dirname, 'fixtures', filePath)
}

//
// tests
//

it('Check createGulpEsbuild export. Return function should equals gulpEsbuild function.', () => {
	const fn = createGulpEsbuild()
	expect(fn.name).toBe(gulpEsbuild.name)
})

describe('Check file system files', () => {
	it('Got non-existent file. It should throw an error.', () => {
		const stream = gulpEsbuild()

		wrapStream(stream).catch(err => {
			expect(err.message).toMatch('Could not resolve')
		})
	
		stream.write(new Vinyl({
			path: resolve('not-existed.js'),
			contents: Buffer.from(''),
		}))
	
		stream.end()
	})
	
	it('Got null. It should throw an error.', () => {
		const stream = gulpEsbuild()
	
		wrapStream(stream).catch(err => {
			expect(err.message).toMatch('File should be a buffer')
		})
	
		stream.write(new Vinyl({
			path: resolve('empty-file.js'),
		}))
	
		stream.end()
	})
	
	it('Got stream. It should throw an error.', () => {
		const stream = gulpEsbuild()
	
		wrapStream(stream).catch(err => {
			expect(err.message).toMatch('File should be a buffer')
		})
	
		stream.write(new Vinyl({
			path: resolve('empty-file.js'),
			contents: new Readable(),
		}))
	
		stream.end()
	})
	
	it('Outdir should override default outdir', () => {
		const stream = gulpEsbuild({
			outdir: './subfolder',
		})
	
		wrapStream(stream).then(files => {
			files.forEach(file => expect(file.path).toMatch('/subfolder/'))
		})
	
		stream.write(new Vinyl({
			path: resolve('empty-file.js'),
			contents: Buffer.from(''),
		}))
		stream.end()
	})
	
	it('Outfile should override default outdir', () => {
		const stream = gulpEsbuild({
			outfile: 'bundle.js',
		})
	
		// This plugin sets outdir option by default if user doesn't override it
		// Outfile and outdir can not be used together so if there is no an error it's ok
		wrapStream(stream).then(files => {
			files.forEach(file => expect(file.path).not.toBeNull())
		})
	
		stream.write(new Vinyl({
			path: resolve('empty-file.js'),
			contents: Buffer.from(''),
		}))
		stream.end()
	})
	
	it('Entry files number should equal output files number', () => {
		const stream = gulpEsbuild()
	
		wrapStream(stream).then(files => {
			expect(files.length).toBe(2)
		})
	
		stream.write(new Vinyl({
			path: resolve('empty-file.js'),
			contents: Buffer.from(''),
		}))
		stream.write(new Vinyl({
			path: resolve('a.js'),
			contents: Buffer.from(''),
		}))
	
		stream.end()
	})
})

describe('Check virtual files', () => {
	it('Passed contents should pass to plugin.', () => {
		const stream = gulpEsbuild()
		const content = 'console.log("custom content inside empty-file.js")'
	
		wrapStream(stream).then(files => {
			const [file] = files
			expect(file.contents.toString()).toContain(content)
		})
	
		stream.write(new Vinyl({
			path: resolve('empty-file.js'),
			contents: Buffer.from(content),
			base: resolve(''),
		}))
	
		stream.end()
	})

	it ('Pass "outfile" option. Outfile name should be the same', () => {
		const outfile = 'result.jsx'
		const stream = gulpEsbuild({outfile})
		const content = 'console.log("")'

		wrapStream(stream).then(files => {
			const [file] = files
			expect(file.path.endsWith(outfile)).toBeTruthy()
		})

		stream.write(new Vinyl({
			path: resolve('empty-file.js'),
			contents: Buffer.from(content),
			base: resolve(''),
		}))

		stream.end()
	})

	it('Do not pass "outfile" option. Outfile name should have .js extension', () => {
		const stream = gulpEsbuild()
		
		wrapStream(stream).then(files => {
			const [file] = files
			expect(file.path.endsWith('.js')).toBeTruthy()
		})

		stream.write(new Vinyl({
			path: resolve('empty-file.js'),
			contents: Buffer.from(''),
			base: resolve(''),
		}))

		stream.end()
	})
})

describe('Check metafile', () => {
	it('Generate metafile.', async () => {
		const stream = gulpEsbuild({
			metafile: true,
		})
	
		wrapStream(stream).then(files => {
			expect(files.length).toBe(2)
			expect(files[1].path).toBe('metafile.json')
		})
	
		stream.write(new Vinyl({
			path: resolve('empty-file.js'),
			contents: Buffer.from(''),
		}))
	
		stream.end()
	})
	
	it('Set custom name.', async () => {
		const stream = gulpEsbuild({
			metafile: true,
			metafileName: 'meta.json',
		})
	
		wrapStream(stream).then(files => {
			expect(files.length).toBe(2)
			expect(files[1].path).toBe('meta.json')
		})
	
		stream.write(new Vinyl({
			path: resolve('empty-file.js'),
			contents: Buffer.from(''),
		}))
	
		stream.end()
	})
})
