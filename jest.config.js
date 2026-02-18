module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'jsx', 'json'],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-fit-image)/)'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/**/index.js',
  ],
  coverageThreshold: {
    global: {
      statements: 24,
      branches: 24,
      functions: 19,
      lines: 24,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
