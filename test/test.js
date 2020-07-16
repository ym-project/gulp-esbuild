const gulpEsbuild = require('..')
const path = require('path')
const fs   = require('fs')
const File = require('vinyl')

test('bundle without option "entryPoints"', async () => {
    const filePath = path.resolve(__dirname, 'fixtures', 'a.js')
    const fileBuffer = await fs.promises.readFile(filePath)
    const stream = gulpEsbuild({
        outfile: 'bundle.js',
        format: 'iife',
        bundle: true
    })

    stream.on('data', file => {
        expect(file.contents.toString()).toBe(
`(() => {
  // test/fixtures/a.js
  console.log("hello, world");
})();
`
        )
    })

    stream.write(new File({
        path: filePath,
        contents: fileBuffer
    }))

    stream.end()
})

test('bundle typescipt', async () => {
    const filePath = path.resolve(__dirname, 'fixtures', 'b.ts')
    const fileBuffer = await fs.promises.readFile(filePath)
    const stream = gulpEsbuild({
        outfile: 'bundle.js',
        format: 'iife',
        bundle: true,
        loader: {
            '.ts': 'ts'
        }
    })

    stream.on('data', file => {
        expect(file.contents.toString()).toBe(
`(() => {
  // test/fixtures/b.ts
  const a = 10;
  console.log(a);
})();
`
        )
    })

    stream.write(new File({
        path: filePath,
        contents: fileBuffer
    }))

    stream.end()
})

test('minify bundle', async () => {
    const filePath = path.resolve(__dirname, 'fixtures', 'b.ts')
    const fileBuffer = await fs.promises.readFile(filePath)
    const stream = gulpEsbuild({
        outfile: 'bundle.js',
        format: 'iife',
        bundle: true,
        loader: {
            '.ts': 'ts'
        },
        minify: true
    })

    stream.on('data', file => {
        expect(file.contents.toString()).toBe(
`(()=>{const a=10;console.log(a);})();
`
        )
    })

    stream.write(new File({
        path: filePath,
        contents: fileBuffer
    }))

    stream.end()
})

test('bundle commonjs', async () => {
    const filePath = path.resolve(__dirname, 'fixtures', 'c.js')
    const fileBuffer = await fs.promises.readFile(filePath)
    const stream = gulpEsbuild({
        outfile: 'bundle.js',
        format: 'cjs',
        bundle: true,
    })

    stream.on('data', file => {
        expect(file.contents.toString()).toBe(
`var __commonJS = (callback, module) => () => {
  if (!module) {
    module = {exports: {}};
    callback(module.exports, module);
  }
  return module.exports;
};

// test/fixtures/d.js
var require_d = __commonJS((exports, module) => {
  module.exports = function say(phrase) {
    console.log(phrase);
  };
});

// test/fixtures/c.js
const d = require_d();
d.say("hi!");
`
        )
    })

    stream.write(new File({
        path: filePath,
        contents: fileBuffer
    }))

    stream.end()
})
