import * as Notifications from 'expo-notifications';
import { NativeModules, Platform } from 'react-native';

import type { FirebaseRemoteMessage } from './firebaseMessaging';

const FOREGROUND_CHANNEL_ID = 'foreground-fcm';

if (NativeModules.RNFBAppModule) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function configureForegroundNotifications(): Promise<void> {
  if (Platform.OS !== 'android' || !NativeModules.RNFBAppModule) {
    return;
  }

  await Notifications.setNotificationChannelAsync(FOREGROUND_CHANNEL_ID, {
    importance: Notifications.AndroidImportance.HIGH,
    name: 'Foreground Notifications',
    vibrationPattern: [0, 250, 250, 250],
  });
}

export async function presentForegroundNotification(
  message: FirebaseRemoteMessage,
): Promise<void> {
  if (!NativeModules.RNFBAppModule) {
    return;
  }

  const title = typeof message.notification?.title === 'string'
    ? message.notification.title
    : typeof message.data?.title === 'string' ? message.data.title : '';
  const body = typeof message.notification?.body === 'string'
    ? message.notification.body
    : typeof message.data?.body === 'string' ? message.data.body : '';

  if (!title && !body) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      body,
      data: {
        ...message.data,
        messageId: message.messageId ?? '',
      },
      sound: true,
      title: title || 'PingDom',
    },
    trigger: Platform.OS === 'android' ? { channelId: FOREGROUND_CHANNEL_ID } : null,
  });
}
