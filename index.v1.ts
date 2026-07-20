import { registerRootComponent } from 'expo';

import './src/i18n';
import App from './App.v1';
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

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

