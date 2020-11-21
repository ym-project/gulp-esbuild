[![downloads per month](https://img.shields.io/npm/dm/gulp-esbuild?style=flat-square)](https://npmcharts.com/compare/gulp-esbuild?minimal=true)

# gulp-esbuild

gulp plugin for [esbuild](https://github.com/evanw/esbuild) bundler

## Install
```bash
npm install gulp-esbuild
```

## Example

`gulpfile.js`
```js
const { src, dest } = require('gulp')
const gulpEsbuild = require('gulp-esbuild')

function build() {
    return src('./index.tsx')
        .pipe(gulpEsbuild({
            outfile: 'bundle.js',
            bundle: true,
            loader: {
                '.tsx': 'tsx'
            }
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

More examples [here](https://github.com/ym-project/gulp-esbuild/tree/master/examples)

## Plugin arguments

| **Name**                                                               | **Type**                               | **Default** |
| :--------------------------------------------------------------------- | :------------------------------------: | :---------: |
| [sourcemap](https://esbuild.github.io/api/#sourcemap)                  | `boolean\|'inline'\|'external'`        |             |
| [format](https://esbuild.github.io/api/#format)                        | `'iife'\|'cjs'\|'esm'`                 |             |
| [globalName](https://esbuild.github.io/api/#global-name)               | `string`                               |             |
| [target](https://esbuild.github.io/api/#target)                        | `string`                               |             |
| [minify](https://esbuild.github.io/api/#minify)                        | `boolean`                              |             |
| [minifyWhitespace](https://esbuild.github.io/api/#minify)              | `boolean`                              |             |
| [minifyIdentifiers](https://esbuild.github.io/api/#minify)             | `boolean`                              |             |
| [minifySyntax](https://esbuild.github.io/api/#minify)                  | `boolean`                              |             |
| [charset](https://esbuild.github.io/api/#charset)                      | `'ascii'\|'utf8'`                      |             |
| [treeShaking](https://esbuild.github.io/api/#tree-shaking)             | `true\|'ignore-annotations'`           |             |
| [jsxFactory](https://esbuild.github.io/api/#jsx-factory)               | `string`                               |             |
| [jsxFragment](https://esbuild.github.io/api/#jsx-fragment)             | `string`                               |             |
| [define](https://esbuild.github.io/api/#define)                        | `object`                               |             |
| [pure](https://esbuild.github.io/api/#pure)                            | `string`                               |             |
| [avoidTDZ](https://esbuild.github.io/api/#avoid-tdz)                   | `boolean`                              |             |
| [keepNames](https://esbuild.github.io/api/#keep-names)                 | `boolean`                              |             |
| [banner](https://esbuild.github.io/api/#banner)                        | `string`                               |             |
| [footer](https://esbuild.github.io/api/#footer)                        | `string`                               |             |
| [color](https://esbuild.github.io/api/#color)                          | `boolean`                              |             |
| [logLevel](https://esbuild.github.io/api/#log-level)                   | `'info'\|'warning'\|'error'\|'silent'` | `'silent'`  |
| [errorLimit](https://esbuild.github.io/api/#error-limit)               | `number`                               |             |
| [bundle](https://esbuild.github.io/api/#bundle)                        | `boolean`                              |             |
| [splitting](https://esbuild.github.io/api/#splitting)                  | `boolean`                              |             |
| [outfile](https://esbuild.github.io/api/#outfile)                      | `string`                               |             |
| [metafile](https://esbuild.github.io/api/#metafile)                    | `string`                               |             |
| [outdir](https://esbuild.github.io/api/#outdir)                        | `string`                               |             |
| [outbase](https://esbuild.github.io/api/#outbase)                      | `string`                               |             |
| [platform](https://esbuild.github.io/api/#platform)                    | `'browser'\|'node'`                    |             |
| [external](https://esbuild.github.io/api/#external)                    | `array`                                |             |
| [loader](https://esbuild.github.io/api/#loader)                        | `object`                               |             |
| [resolveExtensions](https://esbuild.github.io/api/#resolve-extensions) | `array`                                |             |
| [mainFields](https://esbuild.github.io/api/#main-fields)               | `array`                                |             |
| [tsconfig](https://esbuild.github.io/api/#tsconfig)                    | `string`                               |             |
| [outExtension](https://esbuild.github.io/api/#out-extension)           | `object`                               |             |
| [publicPath](https://esbuild.github.io/api/#public-path)               | `string`                               |             |
| [inject](https://esbuild.github.io/api/#inject)                        | `array`                                |             |
| [plugins](https://esbuild.github.io/plugins/)                          | `array`                                |             |
