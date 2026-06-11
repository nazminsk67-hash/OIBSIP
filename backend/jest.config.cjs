/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
  setupFiles: ['<rootDir>/tests/setup.js'],
  transform: {},
  moduleFileExtensions: ['js', 'json'],
  testTimeout: 15000,
  verbose: true,
}
