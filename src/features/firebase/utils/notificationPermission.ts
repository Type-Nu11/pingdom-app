import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

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
    const authorizationStatus = await messaging().requestPermission();

    return (
      authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  } catch {
    return false;
  }
}
