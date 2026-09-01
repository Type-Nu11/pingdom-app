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
    // jsbarcode publishes untranspiled ESM under src/, and @aramir/react-native-barcode
    // imports it directly, so both have to go through Babel here.
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@react-navigation/.*|react-native-svg|react-native-safe-area-context|@tanstack/.*|@aramir/react-native-barcode|jsbarcode)',
  ],
  watchman: false,
};
