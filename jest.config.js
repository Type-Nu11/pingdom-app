module.exports = {
  preset: 'jest-expo',
  clearMocks: true,
  restoreMocks: true,
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/test/mocks/svgMock.tsx',
  },
  setupFiles: ['<rootDir>/test/jest.env.js'],
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts'],
  testMatch: ['<rootDir>/**/__tests__/**/*.test.{ts,tsx}'],
  transformIgnorePatterns: [
    // react-native-qrcode-svg publishes JSX under src/, so Babel must transform it.
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@react-navigation/.*|react-native-svg|react-native-qrcode-svg|react-native-safe-area-context|@tanstack/.*)',
  ],
  watchman: false,
};
