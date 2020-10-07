module.exports = {
	parserOptions: {
		sourceType: 'module',
	},
	extends: [
		'eslint:recommended',
	],
	env: {
		node: true,
		es2021: true,
		jest: true,
	},
	rules: {
		// disallow __proto__
		'no-proto': 'error',
		// disallow return await
		'no-return-await': 'error',
		// disallow eval
		'no-eval': 'error',
		// max line length
		'max-len': [
			'error',
			{code: 120},
		],
		// require empty line in the end of file
		'eol-last': 'error',
		// allow single quotes and backticks with ${}
		'quotes': [
			'error',
			'single',
		],
		// disallow ;
		'semi': [
			'error',
			'never',
		],
		// require trailing comma only when entity has multiline format
		'comma-dangle': [
			'error',
			{
				arrays: 'always-multiline',
				objects: 'always-multiline',
				imports: 'always-multiline',
				exports: 'always-multiline',
				functions: 'never',
			},
		],
		// disallow func( 'arg' ), only func('arg')
		'space-in-parens': [
			'error',
			'never',
		],
		// disallow if, for, ... without brackets
		'curly': 'error',
	},
}
