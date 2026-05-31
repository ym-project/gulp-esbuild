/** @type {import('jest').Config} */
export default {
	testEnvironment: 'node',
	moduleFileExtensions: ['ts', 'js', 'json'],
	transform: {
		'^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
	},
};
