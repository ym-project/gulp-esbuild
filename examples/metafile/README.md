# Metafile example

This example demonstrates how to generate metafile using `gulp-esbuild` plugin.

In esbild 0.9.0 release behavior of the `metafile` option was changed. Now this option can be as boolean only.
So if you want to generate metafile you should set `metafile: true`, if you don't want - `metafile: false`.

By default generated metafile name is `metafile.json`. If you want to change name you should use `metafileName` option.
```js
gulpEsbuils({
	metafile: true, // generate file
	metafileName: 'myName.json', // set metafile name
})
```

## How to use
- `npm i` - install dependencies
- `npm run build-default-metafile` - generate metafile with default name
- `npm run build-named-metafile` - generate metafile with passed name (name set in plugin arguments)
