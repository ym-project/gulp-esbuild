# Metafile example

This example demonstrates how to generate metafile using `gulp-esbuild` plugin.

By default generated metafile name is `metafile.json`. If you want to change the name you should use `metafileName` option.

```js
gulpEsbuild({
	/** allows to generate file */
	metafile: true,
	/** sets metafile name */
	metafileName: 'custom-name.json',
});
```

## How to use

- `npm i` - installs dependencies
- `npm run build:default` - generates metafile using default name
- `npm run build:custom` - generates metafile using custom name
