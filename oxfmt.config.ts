import { defineConfig } from 'oxfmt';

export default defineConfig({
	printWidth: 100,
	tabWidth: 4,
	useTabs: true,
	semi: true,
	singleQuote: true,
	trailingComma: 'all',
	sortImports: {
		newlinesBetween: false,
		groups: [
			'type',
			'side_effect_style',
			'side_effect',
			'style',
			'builtin',
			'subpath',
			'external',
			'internal',
			'parent',
			'sibling',
			'index',
			'unknown',
		],
	},
	sortPackageJson: true,
	insertFinalNewline: true,
});
