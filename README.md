[![downloads per month](https://img.shields.io/npm/dm/gulp-esbuild?style=flat-square)](https://npmcharts.com/compare/gulp-esbuild?minimal=true)

# gulp-esbuild
gulp plugin for [esbuild](https://github.com/evanw/esbuild) bundler

Plugin has 2 cases: `gulpEsbuild` default export and `createGulpEsbuild` named export.

In most cases use `gulpEsbuild` default export.
You should use `createGulpEsbuild` named export if you want to enable incremental build or piping mode.
- [Esbuild incremental build](https://esbuild.github.io/api/#incremental) lets you to rebuild only changed part of code. Use it with gulp watch mode only. See [example](https://github.com/ym-project/gulp-esbuild/tree/master/examples/watch);
- Piping mode lets you to receive data from other plugin via stream piping. See [example](https://github.com/ym-project/gulp-esbuild/tree/master/examples/piping).

To enable incremental mode use
```js
const {createGulpEsbuild} = require('gulp-esbuild')
const gulpEsbuild = createGulpEsbuild({ incremental: true })
```

To enable pipe mode use
```js
const {createGulpEsbuild} = require('gulp-esbuild')
const gulpEsbuild = createGulpEsbuild({ pipe: true })
```

### Notice
This plugin doesn't receive data from other plugins via piping by default. To enable it use `createGulpEsbuild` with `pipe: true` flag.

## Install
```bash
npm install gulp-esbuild
```

## Examples

### build example

`gulpfile.js`
```js
const {
    src,
    dest,
} = require('gulp')
const gulpEsbuild = require('gulp-esbuild')

function build() {
    return src('./index.tsx')
        .pipe(gulpEsbuild({
            outfile: 'bundle.js',
            bundle: true,
            loader: {
                '.tsx': 'tsx',
            },
        }))
        .pipe(dest('./dist'))
}

exports.build = build
```
`package.json`
```json
...
"scripts": {
    "build": "gulp build"
}
...
```
`command line`
```bash
npm run build
```

### watch mode example

`gulpfile.js`
```js
const {
    src,
    dest,
    watch,
} = require('gulp')
const {createGulpEsbuild} = require('gulp-esbuild')
const gulpEsbuild = createGulpEsbuild({ incremental: true })

function build() {
    return src('./src/index.js')
        .pipe(gulpEsbuild({
            outfile: 'outfile.js',
            bundle: true,
        }))
        .pipe(dest('./dist'))
}

function watchTask() {
    watch('./src/index.js', build)
}

exports.watch = watchTask
```
`package.json`
```json
...
"scripts": {
    "watch": "gulp watch"
}
...
```
`command line`
```bash
npm run watch
```

More examples [here](https://github.com/ym-project/gulp-esbuild/tree/master/examples)

## Plugin arguments

| **Name**                                                               | **Type**                                | **Default** |
| :--------------------------------------------------------------------- | :-------------------------------------: | :---------------: |
| [sourcemap](https://esbuild.github.io/api/#sourcemap)                  | `boolean\|'inline'\|'external'\|'both'` |                   |
| [sourcesContent](https://esbuild.github.io/api/#sources-content)       | `boolean`                               |                   |
| [format](https://esbuild.github.io/api/#format)                        | `'iife'\|'cjs'\|'esm'`                  |                   |
| [globalName](https://esbuild.github.io/api/#global-name)               | `string`                                |                   |
| [target](https://esbuild.github.io/api/#target)                        | `string`                                |                   |
| [minify](https://esbuild.github.io/api/#minify)                        | `boolean`                               |                   |
| [minifyWhitespace](https://esbuild.github.io/api/#minify)              | `boolean`                               |                   |
| [minifyIdentifiers](https://esbuild.github.io/api/#minify)             | `boolean`                               |                   |
| [minifySyntax](https://esbuild.github.io/api/#minify)                  | `boolean`                               |                   |
| [charset](https://esbuild.github.io/api/#charset)                      | `'ascii'\|'utf8'`                       |                   |
| [treeShaking](https://esbuild.github.io/api/#tree-shaking)             | `true\|'ignore-annotations'`            |                   |
| [jsxFactory](https://esbuild.github.io/api/#jsx-factory)               | `string`                                |                   |
| [jsxFragment](https://esbuild.github.io/api/#jsx-fragment)             | `string`                                |                   |
| [define](https://esbuild.github.io/api/#define)                        | `object`                                |                   |
| [pure](https://esbuild.github.io/api/#pure)                            | `string`                                |                   |
| [keepNames](https://esbuild.github.io/api/#keep-names)                 | `boolean`                               |                   |
| [banner](https://esbuild.github.io/api/#banner)                        | `object`                                |                   |
| [footer](https://esbuild.github.io/api/#footer)                        | `object`                                |                   |
| [color](https://esbuild.github.io/api/#color)                          | `boolean`                               |                   |
| [logLevel](https://esbuild.github.io/api/#log-level)                   | `'debug'\|'info'\|'warning'\|'error'\|'silent'`  | `'silent'`        |
| [logLimit](https://esbuild.github.io/api/#log-limit)                   | `number`                                |                   |
| [bundle](https://esbuild.github.io/api/#bundle)                        | `boolean`                               |                   |
| [splitting](https://esbuild.github.io/api/#splitting)                  | `boolean`                               |                   |
| [preserveSymlinks](https://esbuild.github.io/api/#preserve-symlinks)   | `boolean`                               |                   |
| [outfile](https://esbuild.github.io/api/#outfile)                      | `string`                                |                   |
| [metafile](https://esbuild.github.io/api/#metafile)                    | `boolean`                               |                   |
| metafileName                                                           | `string`                                | `'metafile.json'` |
| [outdir](https://esbuild.github.io/api/#outdir)                        | `string`                                |                   |
| [outbase](https://esbuild.github.io/api/#outbase)                      | `string`                                |                   |
| [platform](https://esbuild.github.io/api/#platform)                    | `'browser'\|'node'\|'neutral'`          |                   |
| [external](https://esbuild.github.io/api/#external)                    | `array`                                 |                   |
| [loader](https://esbuild.github.io/api/#loader)                        | `object`                                |                   |
| [resolveExtensions](https://esbuild.github.io/api/#resolve-extensions) | `array`                                 |                   |
| [mainFields](https://esbuild.github.io/api/#main-fields)               | `array`                                 |                   |
| [conditions](https://esbuild.github.io/api/#conditions)                | `array`                                 |                   |
| [tsconfig](https://esbuild.github.io/api/#tsconfig)                    | `string`                                |                   |
| [outExtension](https://esbuild.github.io/api/#out-extension)           | `object`                                |                   |
| [publicPath](https://esbuild.github.io/api/#public-path)               | `string`                                |                   |
| [entryNames](https://esbuild.github.io/api/#entry-names)               | `string`                                |                   |
| [chunkNames](https://esbuild.github.io/api/#chunk-names)               | `string`                                |                   |
| [assetNames](https://esbuild.github.io/api/#asset-names)               | `string`                                |                   |
| [inject](https://esbuild.github.io/api/#inject)                        | `array`                                 |                   |
| [plugins](https://esbuild.github.io/plugins/)                          | `array`                                 |                   |
