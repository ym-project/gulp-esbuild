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

// Notice!
// Esbuild read files from file system by default. We can't pass contents or non-exist path via Vinyl.
// So we set real path and empty contents fields.
// new Vinyl({ path, contents })

it('Got non-existent file. It should throw an error.', () => {
	const stream = gulpEsbuild()

	wrapStream(stream).catch(err => {
		expect(err.message).toMatch('Could not read from file')
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

it('Check createGulpEsbuild export. Return function should equals gulpEsbuild function.', () => {
	const fn = createGulpEsbuild()
	expect(fn.name).toBe(gulpEsbuild.name)
})

// Notice!
// Previously we wrote that we can't to pass contents via Vinyl because esbuild read files from file system.
// Flag "pipe" changes a behavior. It use esbuild stdin API and esbuild can read files contents via Vinyl.
// So we can pass any contents and path and it'll be ok.

it('Check pipe flag. Passed contents should pass to plugin.', () => {
	const fn = createGulpEsbuild({pipe: true})
	const stream = fn()
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
