module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  modulePathIgnorePatterns: [
    '<rootDir>/functions/lib/',
    '<rootDir>/functions/',
    '<rootDir>/elevate/',
    '<rootDir>/android/',
    '<rootDir>/ios/',
  ],
  testPathIgnorePatterns: ['<rootDir>/__tests__/Analytics/'],
};
