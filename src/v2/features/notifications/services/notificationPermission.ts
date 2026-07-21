import { PermissionsAndroid, Platform } from 'react-native';

import { getFirebaseMessagingRuntime } from './firebaseMessaging';

let permissionPromise: Promise<boolean> | null = null;

async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;

      if (await PermissionsAndroid.check(permission)) {
        return true;
      }

      return await PermissionsAndroid.request(permission)
        === PermissionsAndroid.RESULTS.GRANTED;
    }

    const firebaseMessaging = getFirebaseMessagingRuntime();

    if (!firebaseMessaging) {
      return false;
    }

    const status = await firebaseMessaging.requestPermission(firebaseMessaging.messaging);
    return status === firebaseMessaging.AuthorizationStatus.AUTHORIZED
      || status === firebaseMessaging.AuthorizationStatus.PROVISIONAL;
  } catch (error) {
    console.warn('[V2 FCM] Notification permission failed:', error);
    return false;
  }
}

export function ensureNotificationPermission(): Promise<boolean> {
  if (!permissionPromise) {
    permissionPromise = requestNotificationPermission().finally(() => {
      permissionPromise = null;
    });
  }

  return permissionPromise;
}
