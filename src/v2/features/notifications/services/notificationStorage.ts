import AsyncStorage from '@react-native-async-storage/async-storage';

import type { NotificationRoute } from '../model/notification.types';

const LAST_BACKGROUND_NOTIFICATION_KEY = 'firebase:last-background-notification';

export async function saveLastBackgroundNotification(route: NotificationRoute): Promise<void> {
  await AsyncStorage.setItem(LAST_BACKGROUND_NOTIFICATION_KEY, JSON.stringify(route));
}

export async function takeLastBackgroundNotification(): Promise<NotificationRoute | null> {
  const rawValue = await AsyncStorage.getItem(LAST_BACKGROUND_NOTIFICATION_KEY);

  if (!rawValue) {
    return null;
  }

  await AsyncStorage.removeItem(LAST_BACKGROUND_NOTIFICATION_KEY);

  try {
    return JSON.parse(rawValue) as NotificationRoute;
  } catch {
    return null;
  }
}
