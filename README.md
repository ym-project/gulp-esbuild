<a href="https://npmcharts.com/compare/gulp-esbuild?minimal=true">
    <img alt="downloads per month" src="https://img.shields.io/npm/dm/gulp-esbuild?style=for-the-badge">
</a>

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

You can find all available options in the typescript declaration file in the official repository [https://github.com/evanw/esbuild/blob/master/lib/types.ts](https://github.com/evanw/esbuild/blob/master/lib/types.ts).

Pay attention to such interfaces as `CommonOptions` and `BuildOptions`.

Other interfaces aren't used in this plugin.
