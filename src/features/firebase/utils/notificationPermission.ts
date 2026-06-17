import { PermissionsAndroid, Platform } from 'react-native';
import { getFirebaseMessagingRuntime } from './firebaseMessaging';

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
    const alreadyGranted = await PermissionsAndroid.check(permission);

    if (alreadyGranted) {
      return true;
    }

    const status = await PermissionsAndroid.request(permission);
    return status === PermissionsAndroid.RESULTS.GRANTED;
  }

  try {
    const firebaseMessaging = getFirebaseMessagingRuntime();

    if (!firebaseMessaging) {
      return false;
    }

    const authorizationStatus = await firebaseMessaging.requestPermission(
      firebaseMessaging.messaging
    );

    return (
      authorizationStatus === firebaseMessaging.AuthorizationStatus.AUTHORIZED ||
      authorizationStatus === firebaseMessaging.AuthorizationStatus.PROVISIONAL
    );
  } catch {
    return false;
  }
}
