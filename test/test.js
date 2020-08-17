const gulpEsbuild = require('..')
const path = require('path')
const File = require('vinyl')

/*
** test CommonOptions
*/

describe('test CommonOptions', () => {
    describe('sourcemap', () => {
        test('boolean', done => {
            const stream = gulpEsbuild({
                outfile:   'bundle.js',
                sourcemap: false
            })
            execute(stream, {contents:
`console.log("hello, world");
`
            }).then(done, done)

            stream.write(new File({
                path:     resolve('for-sourcemap.js'),
                contents: Buffer.from('')
            }))
            stream.end()
        })

        // TODO: incorrect working. Should be fix soon
        //
//         test('inline', done => {
//             const stream = gulpEsbuild({
//                 outfile:   'bundle.js',
//                 sourcemap: 'inline'
//             })
//             execute(stream, {contents:
// `console.log("hello, world");
// //# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidGVzdC9maXh0dXJlcy9hLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zb2xlLmxvZygnaGVsbG8sIHdvcmxkJylcbiJdLAogICJtYXBwaW5ncyI6ICJBQUFBLFFBQVEsSUFBSTsiLAogICJuYW1lcyI6IFtdCn0K
// `
//             }).then(done, done)

//             stream.write(new File({
//                 path:     resolve('for-sourcemap.js'),
//                 contents: Buffer.from('')
//             }))
//             stream.end()
//         })

//         test('external', done => {
//             const stream = gulpEsbuild({
//                 outfile:   'bundle.js',
//                 sourcemap: 'external'
//             })
//             execute(stream, [{
//                 contents:
// `console.log("hello, world");
// {
//   "version": 3,
//   "sources": ["test/fixtures/a.js"],
//   "sourcesContent": ["console.log('hello, world')\\n"],
//   "mappings": "AAAA,QAAQ,IAAI;",
//   "names": []
// }
// `
//             }, {
//                 contents:
// `
// `
//             }]).then(done, done)

//             const file = new File({
//                 path:     resolve('for-sourcemap.js'),
//                 contents: Buffer.from('')
//             })
//             // file.sourceMap = {}

//             stream.write(file)
//             stream.end()
//         })
    })

    describe('target', () => {
        it('es2015', done => {
            const stream = gulpEsbuild({
                outfile: 'bundle.js',
                target:  'es2015'
            })
            execute(stream, {contents:
`class A {
  constructor() {
    this.field = "value";
  }
  method(...args) {
    args.forEach((arg) => console.log(arg));
  }
}
`
            }).then(done, done)

            stream.write(new File({
                path:     resolve('for-target.js'),
                contents: Buffer.from('')
            }))
            stream.end()
        })

        it('esnext', done => {
            const stream = gulpEsbuild({
                outfile: 'bundle.js',
                target:  'esnext'
            })
            execute(stream, {contents:
`class A {
  field = "value";
  method(...args) {
    args.forEach((arg) => console.log(arg));
  }
}
`
            }).then(done, done)

            stream.write(new File({
                path:     resolve('for-target.js'),
                contents: Buffer.from('')
            }))
            stream.end()
        })
    })

    describe('strict', () => {

    })

    describe('minify', () => {

    })

    describe('jsx', () => {

    })

    describe('define', () => {

    })

    describe('pure', () => {

    })
})


/*
** helpers
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

            expect(fileContents).toBe(expectedItem.contents)
        }

        return Promise.resolve()
    })
}
