import { getFirebaseMessagingRuntime } from './firebaseMessaging';
import { parseNotificationRoute } from './notificationPayload';
import { saveLastBackgroundNotification } from './notificationStorage';

export function registerBackgroundNotificationHandler(): void {
  const firebaseMessaging = getFirebaseMessagingRuntime();

  if (!firebaseMessaging) {
    return;
  }

  firebaseMessaging.setBackgroundMessageHandler(firebaseMessaging.messaging, async (message) => {
    try {
      await saveLastBackgroundNotification(
        parseNotificationRoute(message, 'background-message'),
      );
    } catch {
      console.warn('[V2 FCM] Background notification handling failed.');
    }
  });
}
