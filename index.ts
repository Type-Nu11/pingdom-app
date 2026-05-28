import { registerRootComponent } from 'expo';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';

import App from './App';
import { parseNotificationRoute } from './src/features/firebase/utils/notificationPayload';
import { saveLastBackgroundNotification } from './src/features/firebase/utils/notificationStorage';

setBackgroundMessageHandler(getMessaging(getApp()), async (remoteMessage) => {
  try {
    const route = parseNotificationRoute(remoteMessage, 'background-message');
    await saveLastBackgroundNotification(route);
  } catch (error) {
    console.warn('Background notification handle failed:', error);
  }
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
