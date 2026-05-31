[![downloads per month](https://img.shields.io/npm/dm/gulp-esbuild?style=flat-square)](https://npmcharts.com/compare/gulp-esbuild?minimal=true)

# gulp-esbuild

A [gulp](https://gulpjs.com) plugin for the [esbuild](https://esbuild.github.io) bundler.

There are 2 available exports: `gulpEsbuild` and `createGulpEsbuild`. In most cases you should use the `gulpEsbuild` export. Use the `createGuipEsbuild` export if you want to enable the esbuild's incremental build.

The [esbuild's incremental build](https://esbuild.github.io/api/#incremental) is used with the [gulp's watching files API](https://gulpjs.com/docs/en/getting-started/watching-files/) and allows you to rebuild only changed parts of code ([example](https://github.com/ym-project/gulp-esbuild/tree/v0/examples/watch));

## Installation

```bash
npm install gulp-esbuild esbuild gulp
```

or

```bash
yarn add gulp-esbuild esbuild
```

## Examples

### Build example

`gulpfile.js`

```js
const { src, dest } = require('gulp');
const { gulpEsbuild } = require('gulp-esbuild');

function build() {
	return src('./index.tsx')
		.pipe(
			gulpEsbuild({
				outfile: 'bundle.js',
				bundle: true,
				loader: {
					'.tsx': 'tsx',
				},
			}),
		)
		.pipe(dest('./dist'));
}

exports.build = build;
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

### Watch mode example

`gulpfile.js`

```js
const { src, dest } = require('gulp');
const { createGulpEsbuild } = require('gulp-esbuild');
const gulpEsbuild = createGulpEsbuild({ incremental: true });

function build() {
	return src('./src/index.js')
		.pipe(
			gulpEsbuild({
				outfile: 'outfile.js',
				bundle: true,
			}),
		)
		.pipe(dest('./dist'));
}

function watchTask() {
	watch('./src/index.js', build);
}

exports.watch = watchTask;
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

More examples [here](https://github.com/ym-project/gulp-esbuild/tree/v0/examples)

## Plugin arguments

| **Name**                                                               | **Type**                                                   | **Default**                                       |
| ---------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------- |
| [entryPoints](https://esbuild.github.io/api/#entry-points)             | `array\|object`                                            |                                                   |
| [sourcemap](https://esbuild.github.io/api/#sourcemap)                  | `boolean\|'linked'\|'inline'\|'external'\|'both'`          |                                                   |
| [sourceRoot](https://esbuild.github.io/api/#source-root)               | `string`                                                   |                                                   |
| [sourcesContent](https://esbuild.github.io/api/#sources-content)       | `boolean`                                                  |                                                   |
| [legalComments](https://esbuild.github.io/api/#legal-comments)         | `'none'\|'inline'\|'eof'\|'linked'\|'external'`            |                                                   |
| [format](https://esbuild.github.io/api/#format)                        | `'iife'\|'cjs'\|'esm'`                                     |                                                   |
| [globalName](https://esbuild.github.io/api/#global-name)               | `string`                                                   |                                                   |
| [target](https://esbuild.github.io/api/#target)                        | `string\|array`                                            |                                                   |
| [supported](https://esbuild.github.io/api/#supported)                  | `object`                                                   |                                                   |
| [mangleProps](https://esbuild.github.io/api/#mangle-props)             | `RegExp`                                                   |                                                   |
| [reserveProps](https://esbuild.github.io/api/#mangle-props)            | `RegExp`                                                   |                                                   |
| [mangleQuoted](https://esbuild.github.io/api/#mangle-quoted)           | `boolean`                                                  |                                                   |
| [mangleCache](https://esbuild.github.io/api/#mangle-props)             | `object`                                                   |                                                   |
| [drop](https://esbuild.github.io/api/#drop)                            | `array`                                                    |                                                   |
| [dropLabels](https://esbuild.github.io/api/#drop-labels)               | `array`                                                    |                                                   |
| [minify](https://esbuild.github.io/api/#minify)                        | `boolean`                                                  |                                                   |
| [minifyWhitespace](https://esbuild.github.io/api/#minify)              | `boolean`                                                  |                                                   |
| [minifyIdentifiers](https://esbuild.github.io/api/#minify)             | `boolean`                                                  |                                                   |
| [minifySyntax](https://esbuild.github.io/api/#minify)                  | `boolean`                                                  |                                                   |
| [lineLimit](https://esbuild.github.io/api/#line-limit)                 | `number`                                                   |                                                   |
| [charset](https://esbuild.github.io/api/#charset)                      | `'ascii'\|'utf8'`                                          |                                                   |
| [treeShaking](https://esbuild.github.io/api/#tree-shaking)             | `boolean`                                                  |                                                   |
| [ignoreAnnotations](https://esbuild.github.io/api/#ignore-annotations) | `boolean`                                                  |                                                   |
| [jsx](https://esbuild.github.io/api/#jsx)                              | `'transform'\|'preserve'\|'automatic'`                     |                                                   |
| [jsxFactory](https://esbuild.github.io/api/#jsx-factory)               | `string`                                                   |                                                   |
| [jsxFragment](https://esbuild.github.io/api/#jsx-fragment)             | `string`                                                   |                                                   |
| [jsxImportSource](https://esbuild.github.io/api/#jsx-import-source)    | `string`                                                   |                                                   |
| [jsxDev](https://esbuild.github.io/api/#jsx-dev)                       | `boolean`                                                  |                                                   |
| [jsxSideEffects](https://esbuild.github.io/api/#jsx-side-effects)      | `boolean`                                                  |                                                   |
| [define](https://esbuild.github.io/api/#define)                        | `object`                                                   |                                                   |
| [pure](https://esbuild.github.io/api/#pure)                            | `array`                                                    |                                                   |
| [keepNames](https://esbuild.github.io/api/#keep-names)                 | `boolean`                                                  |                                                   |
| [absPaths](https://esbuild.github.io/api/#abs-paths)                   | `array`                                                    |                                                   |
| [banner](https://esbuild.github.io/api/#banner)                        | `object`                                                   |                                                   |
| [footer](https://esbuild.github.io/api/#footer)                        | `object`                                                   |                                                   |
| [color](https://esbuild.github.io/api/#color)                          | `boolean`                                                  |                                                   |
| [logLevel](https://esbuild.github.io/api/#log-level)                   | `'verbose'\|'debug'\|'info'\|'warning'\|'error'\|'silent'` | `'silent'`                                        |
| [logLimit](https://esbuild.github.io/api/#log-limit)                   | `number`                                                   |                                                   |
| [logOverride](https://esbuild.github.io/api/#log-override)             | `object`                                                   |                                                   |
| [tsconfigRaw](https://esbuild.github.io/api/#tsconfig-raw)             | `string`\|`object`                                         |                                                   |
| [bundle](https://esbuild.github.io/api/#bundle)                        | `boolean`                                                  |                                                   |
| [splitting](https://esbuild.github.io/api/#splitting)                  | `boolean`                                                  |                                                   |
| [preserveSymlinks](https://esbuild.github.io/api/#preserve-symlinks)   | `boolean`                                                  |                                                   |
| [outfile](https://esbuild.github.io/api/#outfile)                      | `string`                                                   |                                                   |
| [metafile](https://esbuild.github.io/api/#metafile)                    | `boolean`                                                  |                                                   |
| metafileName                                                           | `string`                                                   | `'metafile.json'`                                 |
| [outdir](https://esbuild.github.io/api/#outdir)                        | `string`                                                   |                                                   |
| [outbase](https://esbuild.github.io/api/#outbase)                      | `string`                                                   |                                                   |
| [platform](https://esbuild.github.io/api/#platform)                    | `'browser'\|'node'\|'neutral'`                             |                                                   |
| [external](https://esbuild.github.io/api/#external)                    | `array`                                                    |                                                   |
| [packages](https://esbuild.github.io/api/#packages)                    | `'bundle'\|'external'`                                     |                                                   |
| [alias](https://esbuild.github.io/api/#alias)                          | `object`                                                   |                                                   |
| [loader](https://esbuild.github.io/api/#loader)                        | `object`                                                   |                                                   |
| [resolveExtensions](https://esbuild.github.io/api/#resolve-extensions) | `array`                                                    | `['.tsx', '.ts', '.jsx', '.js', '.css', '.json']` |
| [mainFields](https://esbuild.github.io/api/#main-fields)               | `array`                                                    |                                                   |
| [conditions](https://esbuild.github.io/api/#conditions)                | `array`                                                    |                                                   |
| [nodePaths](https://esbuild.github.io/api/#node-paths)                 | `array`                                                    |                                                   |
| [tsconfig](https://esbuild.github.io/api/#tsconfig)                    | `string`                                                   |                                                   |
| [outExtension](https://esbuild.github.io/api/#out-extension)           | `object`                                                   |                                                   |
| [publicPath](https://esbuild.github.io/api/#public-path)               | `string`                                                   |                                                   |
| [entryNames](https://esbuild.github.io/api/#entry-names)               | `string`                                                   |                                                   |
| [chunkNames](https://esbuild.github.io/api/#chunk-names)               | `string`                                                   |                                                   |
| [assetNames](https://esbuild.github.io/api/#asset-names)               | `string`                                                   |                                                   |
| [inject](https://esbuild.github.io/api/#inject)                        | `array`                                                    |                                                   |
| [plugins](https://esbuild.github.io/plugins/)                          | `array`                                                    |                                                   |
