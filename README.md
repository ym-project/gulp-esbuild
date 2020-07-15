### Install
`npm install gulp-esbuild`

### Example

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

exports.build
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

### Plugin arguments

All available options you can find in the typescript declaration file in official repository [https://github.com/evanw/esbuild/blob/master/lib/types.ts](https://github.com/evanw/esbuild/blob/master/lib/types.ts).

Pay attention to interfaces such as: `CommonOptions` and `BuildOptions`.

Another interfaces don't use in this plugin.
