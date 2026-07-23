import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');

  const MockSafeAreaView = ({ children, ...props }: React.PropsWithChildren<object>) =>
    React.createElement(View, props, children);

  return {
    SafeAreaConsumer: ({ children }: { children: (insets: object) => React.ReactNode }) =>
      children({ bottom: 0, left: 0, right: 0, top: 0 }),
    SafeAreaProvider: MockSafeAreaView,
    SafeAreaView: MockSafeAreaView,
    initialWindowMetrics: {
      frame: { height: 844, width: 390, x: 0, y: 0 },
      insets: { bottom: 0, left: 0, right: 0, top: 0 },
    },
    useSafeAreaFrame: () => ({ height: 844, width: 390, x: 0, y: 0 }),
    useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
  };
});

jest.mock('react-native-keychain', () => ({
  ACCESS_CONTROL: {},
  ACCESSIBLE: {},
  getGenericPassword: jest.fn().mockResolvedValue(false),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
  setGenericPassword: jest.fn().mockResolvedValue(true),
}));

beforeEach(async () => {
  await AsyncStorage.clear();
});
