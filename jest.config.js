module.exports = {
  testMatch: ['**/tests/**/*.test.js'],
  moduleFileExtensions: ['js', 'json'],
  moduleDirectories: ['node_modules'],
  modulePathIgnorePatterns: ['directoryNameToIgnore'],
  collectCoverage: true,
  collectCoverageFrom: ['server.js'],
  coveragePathIgnorePatterns: ['/node_modules/', 'dist/'],
  coverageReporters: ['json', 'json-summary', 'lcov', 'text', 'text-summary', 'html'],
  testEnvironment: 'node',
  verbose: true,
  setupFilesAfterEnv: ['jest-extended']
};
