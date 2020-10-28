const gulpEsbuild = require('..')
const File = require('vinyl')
const path = require('path')
const {Readable} = require('stream')

/*
** TESTS
*/

it('should be thrown when the input does not exist', done => {
	const stream = gulpEsbuild()
	wrap(stream).catch(err => {
		expect(err.message).toMatch('Could not read from file')
		done()
	})

	stream.write(new File({
		path: resolve('not-existed.js'),
		contents: Buffer.from(''),
	}))
	stream.end()
})

it('should be thrown when given null files', done => {
	const stream = gulpEsbuild()
	wrap(stream).catch(err => {
		expect(err.message).toMatch('file should be a buffer')
		done()
	})

	stream.write(new File({
		path: resolve('a.js'),
	}))
	stream.end()
})

it('should be thrown when given streamed files', done => {
	const stream = gulpEsbuild()
	wrap(stream).catch(err => {
		expect(err.message).toMatch('file should be a buffer')
		done()
	})

	stream.write(new File({
		path: resolve('a.js'),
		contents: new Readable(),
	}))
	stream.end()
})

it('outdir should override default outdir', done => {
	const stream = gulpEsbuild({
		outdir: './subfolder',
	})
	wrap(stream).then(files => {
		files.forEach(file => {
			expect(file.path).toMatch('/subfolder/')
		})
		done()
	})

	stream.write(new File({
		path: resolve('a.js'),
		contents: Buffer.from(''),
	}))
	stream.end()
})

it('outfile should override default outdir', done => {
	const stream = gulpEsbuild({
		outfile: 'bundle.js',
	})
	// outfile and outdir can not be used together
	// so if there is no an error it's ok
	wrap(stream).then(() => {
		done()
	})

	stream.write(new File({
		path: resolve('a.js'),
		contents: Buffer.from(''),
	}))
	stream.end()
})

it('entry files number should be equaled output files number', done => {
	const stream = gulpEsbuild()

	wrap(stream).then(files => {
		expect(files.length).toBe(2)
		done()
	})

	stream.write(new File({
		path: resolve('a.js'),
		contents: Buffer.from(''),
	}))
	stream.write(new File({
		path: resolve('b.js'),
		contents: Buffer.from(''),
	}))

	stream.end()
})

it('files should be bundled', done => {
	const stream = gulpEsbuild({
		outfile: 'bundle.js',
		bundle: true,
	})
	wrap(stream).then(files => {
		const file = files[0]
		expect(file.contents.toString()).toBe(
`(() => {
  // test/fixtures/a.js
  console.log("a.js");

  // test/fixtures/b.js
  console.log("b.js");
})();
`
		)
		done()
	})

	stream.write(new File({
		path: resolve('c.js'),
		contents: Buffer.from(''),
	}))
	stream.end()
})


/*
** HELPERS
*/

function resolve(name) {
	return path.resolve(__dirname, 'fixtures', name)
}

function wrap(stream) {
	return new Promise((resolve, reject) => {
		const data = []

		stream.on('error', reject)
		stream.on('end', () => {
			resolve(data)
		})
		stream.on('data', chunk => {
			data.push(chunk)
		})
	})
}
