import { registerRootComponent } from 'expo';

import App from './App';
import { registerBackgroundNotificationHandler } from './src/v2/modules/user/notifications/background';

registerBackgroundNotificationHandler();

registerRootComponent(App);
