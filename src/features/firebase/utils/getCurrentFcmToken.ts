import { getFirebaseMessagingRuntime } from './firebaseMessaging';
import { ensureNotificationPermission } from './notificationPermission';

export async function getCurrentFcmToken(): Promise<string | null> {
  const firebaseMessaging = getFirebaseMessagingRuntime();

  if (!firebaseMessaging) {
    return null;
  }

  const hasPermission = await ensureNotificationPermission();

  if (!hasPermission) {
    return null;
  }

  try {
    await firebaseMessaging.registerDeviceForRemoteMessages(firebaseMessaging.messaging);
  } catch {
    // The device may already be registered for remote messages.
  }

  const token = await firebaseMessaging.getToken(firebaseMessaging.messaging);
  return token || null;
}
