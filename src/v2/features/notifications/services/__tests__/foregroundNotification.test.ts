import * as Notifications from 'expo-notifications';

jest.mock('expo-notifications', () => ({
  AndroidImportance: { HIGH: 6 },
  scheduleNotificationAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
}));

jest.mock('react-native', () => {
  return {
    NativeModules: {
      RNFBAppModule: {},
    },
    Platform: {
      OS: 'android',
    },
  };
});

import { configureForegroundNotifications } from '../foregroundNotification';

describe('configureForegroundNotifications', () => {
  test('시스템 기본음을 custom sound 파일명으로 전달하지 않는다', async () => {
    await configureForegroundNotifications();

    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
      'foreground-fcm',
      expect.objectContaining({
        importance: Notifications.AndroidImportance.HIGH,
        name: 'Foreground Notifications',
        vibrationPattern: [0, 250, 250, 250],
      }),
    );
    expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalledWith(
      'foreground-fcm',
      expect.objectContaining({ sound: expect.anything() }),
    );
  });
});
