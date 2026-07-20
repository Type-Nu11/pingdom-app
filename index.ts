import { registerRootComponent } from 'expo';

import './src/i18n';
import App from './App';
import { parseNotificationRoute } from './src/features/firebase/utils/notificationPayload';
import { getFirebaseMessagingRuntime } from './src/features/firebase/utils/firebaseMessaging';
import { saveLastBackgroundNotification } from './src/features/firebase/utils/notificationStorage';

const firebaseMessaging = getFirebaseMessagingRuntime();

if (firebaseMessaging) {
  firebaseMessaging.setBackgroundMessageHandler(firebaseMessaging.messaging, async (remoteMessage) => {
    try {
      const route = parseNotificationRoute(remoteMessage, 'background-message');
      await saveLastBackgroundNotification(route);
    } catch (error) {
      console.warn('Background notification handle failed:', error);
    }
  });
}

registerRootComponent(App);
