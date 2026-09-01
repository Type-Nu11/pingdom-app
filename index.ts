import { registerRootComponent } from 'expo';

import App from './App';
import { registerBackgroundNotificationHandler } from './src/v2/features/notifications/services/backgroundNotification';

registerBackgroundNotificationHandler();

registerRootComponent(App);
