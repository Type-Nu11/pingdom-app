import AsyncStorage from '@react-native-async-storage/async-storage';
import { timeoutManager } from '@tanstack/react-query';

type NodeTimer = ReturnType<typeof setTimeout>;

function unrefTimer(timer: NodeTimer) {
  const unref = (timer as unknown as { unref?: () => void }).unref;
  if (typeof unref === 'function') {
    unref.call(timer);
  }

  return timer;
}

timeoutManager.setTimeoutProvider<NodeTimer>({
  clearInterval: intervalId => clearInterval(intervalId),
  clearTimeout: timeoutId => clearTimeout(timeoutId),
  setInterval: (callback, delay) => unrefTimer(setInterval(callback, delay)),
  setTimeout: (callback, delay) => unrefTimer(setTimeout(callback, delay)),
});

jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  const defaultFrame = { height: 844, width: 390, x: 0, y: 0 };
  const defaultInsets = { bottom: 0, left: 0, right: 0, top: 0 };

  const MockSafeAreaView = ({ children, ...props }: React.PropsWithChildren<object>) =>
    React.createElement(View, props, children);

  return {
    SafeAreaFrameContext: React.createContext(defaultFrame),
    SafeAreaInsetsContext: React.createContext(defaultInsets),
    SafeAreaConsumer: ({ children }: { children: (insets: object) => React.ReactNode }) =>
      children(defaultInsets),
    SafeAreaProvider: MockSafeAreaView,
    SafeAreaView: MockSafeAreaView,
    initialWindowMetrics: {
      frame: defaultFrame,
      insets: defaultInsets,
    },
    useSafeAreaFrame: () => defaultFrame,
    useSafeAreaInsets: () => defaultInsets,
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

jest.mock('react-native-keyboard-controller', () => require('react-native-keyboard-controller/jest'));

jest.mock('expo-audio', () => ({
  getRecordingPermissionsAsync: jest.fn(async () => ({ status: 'undetermined', granted: false, canAskAgain: true })),
  requestRecordingPermissionsAsync: jest.fn(async () => ({ status: 'denied', granted: false, canAskAgain: false })),
}));

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
