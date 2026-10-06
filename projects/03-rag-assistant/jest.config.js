// Keep test output readable; individual tests can still assert on behaviour, not logs.
process.env.LOG_LEVEL ??= 'silent';

/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  clearMocks: true,
};
