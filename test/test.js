const gulpEsbuild = require('..')
const File = require('vinyl')
const path = require('path')

/*
** TESTS
*/

test('prefer entryPoints option to src file', done => {
	const stream = gulpEsbuild({
		outdir: './',
		entryPoints: [
			resolve('a.js'),
			resolve('b.js')
		]
	})

	execute(stream, [
`console.log("a.js");
`
	,
`console.log("b.js");
`
	]).then(done, done)

	stream.write(new File({
		path: resolve('a.js'),
		contents: Buffer.from('')
	}))
	stream.end()
})

test('entry files number === output files number', done => {
	const stream = gulpEsbuild({
		outdir: './'
	})

	execute(stream, [
`console.log("a.js");
`
	,
`console.log("b.js");
`
	]).then(done, done)

	stream.write(new File({
		path: resolve('a.js'),
		contents: Buffer.from('')
	}))
	stream.write(new File({
		path: resolve('b.js'),
		contents: Buffer.from('')
	}))
	stream.end()
})

test('bundle works', done => {
	const stream = gulpEsbuild({
		outfile: 'bundle.js',
		bundle: true
	})

	execute(stream, [
`(() => {
  // test/fixtures/a.js
  console.log("a.js");

  // test/fixtures/b.js
  console.log("b.js");
})();
`
	]).then(done, done)

	stream.write(new File({
		path: resolve('c.js'),
		contents: Buffer.from('')
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

function execute(stream, expected) {
	return executeAll(stream, Array.isArray(expected) ? expected : [ expected ])
}

function executeAll(stream, expected) {
	return wrap(stream).then(files => {
		const keys = Object.keys(expected)

		// if length of array "expected" === 1 check number of output files
		if (keys.length === 1) {
			if (files.length !== 1) {
				throw new Error(`expected 1 file, not ${ files.length }`)
			}
		}

		// else check to number of array keys === number of output files
		else if (keys.length !== files.length) {
			throw new Error(`expected ${ keys.length } files, not ${ files.length }`)
		}

		let index = 0

		for (const file of files) {
			const expectedItem = expected[index]
			const fileContents = file.contents.toString()

			expect(fileContents).toBe(expectedItem)
			index++
		}

		return Promise.resolve()
	})
}
