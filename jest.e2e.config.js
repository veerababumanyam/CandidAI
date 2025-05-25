/**
 * Jest E2E Testing Configuration
 * Specialized configuration for end-to-end Chrome extension testing
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  displayName: 'E2E Tests',
  testMatch: [
    '<rootDir>/tests/e2e/**/*.test.{js,ts}',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/tests/e2e/setup.ts',
  ],
  testTimeout: 60000,
  maxWorkers: 1, // Run E2E tests sequentially
  globalSetup: '<rootDir>/tests/e2e/global-setup.ts',
  globalTeardown: '<rootDir>/tests/e2e/global-teardown.ts',
  moduleNameMapping: {
    '^@types/(.*)$': '<rootDir>/src/ts/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/ts/utils/$1',
    '^@services/(.*)$': '<rootDir>/src/ts/services/$1',
    '^@api/(.*)$': '<rootDir>/src/ts/api/$1',
    '^@platforms/(.*)$': '<rootDir>/src/ts/platforms/$1',
    '^@ui/(.*)$': '<rootDir>/src/ts/ui/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.test.{ts,js}',
    '!src/**/*.spec.{ts,js}',
    '!src/**/*.d.ts',
    '!src/assets/**/*',
  ],
  coverageDirectory: 'coverage/e2e',
  coverageReporters: ['text', 'lcov', 'html'],
}; 