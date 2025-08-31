module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    'core/**/*.js',
    'commands/**/*.js',
    'utils/**/*.js',
    '!utils/RealSystemMetrics.js', // Exclude browser-specific metrics
    '!**/node_modules/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/helpers/testSetup.js'],
  transform: {},
  verbose: false,
  testTimeout: 10000,
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};