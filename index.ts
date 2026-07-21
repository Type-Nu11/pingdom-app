import { registerRootComponent } from 'expo';

import App from './App';
import './src/i18n';
import { registerBackgroundNotificationHandler } from './src/v2/features/notifications/services/backgroundNotification';

registerBackgroundNotificationHandler();

registerRootComponent(App);
