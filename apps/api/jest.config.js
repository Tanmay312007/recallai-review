/**
 * Jest configuration for the RecallAI API (NestJS).
 *
 * Source files use `.js` import specifiers (NodeNext-style) even though nest
 * compiles to CommonJS; the moduleNameMapper rewrites those specifiers so
 * ts-jest can resolve them at test time. The @lumora/shared workspace package
 * is mapped to its TypeScript source so ts-jest transpiles it to CommonJS too
 * (its built dist is ESM-only and cannot be require()d from a CJS test runtime).
 */
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  rootDir: '.',
  roots: ['<rootDir>/src', '<rootDir>/../../packages/shared/src'],
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  testRegex: 'src/.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '^@lumora/shared$': '<rootDir>/../../packages/shared/src/index.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/main.ts'],
  coverageDirectory: 'coverage',
};
