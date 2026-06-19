import type { RemoteMessage } from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const FOREGROUND_CHANNEL_ID = 'foreground-fcm';
const DEFAULT_NOTIFICATION_TITLE = '새 알림';

function toNotificationText(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function configureForegroundNotifications(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(FOREGROUND_CHANNEL_ID, {
    name: 'Foreground Notifications',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#0EA5E9',
  });
}

export async function presentForegroundNotification(message: RemoteMessage): Promise<void> {
  const title =
    toNotificationText(message.notification?.title) ||
    toNotificationText(message.data?.title, DEFAULT_NOTIFICATION_TITLE);
  const body =
    toNotificationText(message.notification?.body) ||
    toNotificationText(message.data?.body);

  if (!title && !body) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: {
        ...message.data,
        messageId: message.messageId ?? '',
      },
      sound: 'default',
    },
    trigger: null,
  });
}
