import AsyncStorage from '@react-native-async-storage/async-storage';

import type { NotificationRoute } from '../model/notification.types';

const LAST_BACKGROUND_NOTIFICATION_KEY = 'firebase:last-background-notification';
const REGISTERED_FCM_TOKEN_KEY = 'firebase:registered-fcm-token';

export async function saveRegisteredFcmToken(token: string): Promise<void> {
  await AsyncStorage.setItem(REGISTERED_FCM_TOKEN_KEY, token);
}

export async function getRegisteredFcmToken(): Promise<string | null> {
  return AsyncStorage.getItem(REGISTERED_FCM_TOKEN_KEY);
}

export async function clearRegisteredFcmToken(expectedToken?: string): Promise<void> {
  if (expectedToken) {
    const storedToken = await getRegisteredFcmToken();
    if (storedToken !== expectedToken) return;
  }

  await AsyncStorage.removeItem(REGISTERED_FCM_TOKEN_KEY);
}

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
