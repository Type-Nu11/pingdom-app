import { getApp } from '@react-native-firebase/app';
import {
  getInitialNotification,
  getMessaging,
  onNotificationOpenedApp,
} from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import {
  setLastBackgroundNotificationRoute,
  setPendingNotificationRoute,
} from '../../../app/store/notificationStore';
import { parseNotificationRoute } from '../utils/notificationPayload';
import {
  clearLastBackgroundNotification,
  getLastBackgroundNotification,
} from '../utils/notificationStorage';

const messagingInstance = getMessaging(getApp());

export function useNotificationOpenSync(): void {
  useEffect(() => {
    const hydrateBackgroundRoute = async () => {
      try {
        const backgroundRoute = await getLastBackgroundNotification();

        if (!backgroundRoute) {
          return;
        }

        setLastBackgroundNotificationRoute(backgroundRoute);
        await clearLastBackgroundNotification();
      } catch (error) {
        console.warn('Background notification hydrate failed:', error);
      }
    };

    const hydrateInitialNotification = async () => {
      try {
        const initialMessage = await getInitialNotification(messagingInstance);

        if (!initialMessage) {
          return;
        }

        setPendingNotificationRoute(parseNotificationRoute(initialMessage, 'quit-open'));
      } catch (error) {
        console.warn('Initial notification hydrate failed:', error);
      }
    };

    void hydrateBackgroundRoute();
    void hydrateInitialNotification();

    const unsubscribe = onNotificationOpenedApp(messagingInstance, (remoteMessage) => {
      setPendingNotificationRoute(parseNotificationRoute(remoteMessage, 'background-open'));
    });

    return unsubscribe;
  }, []);
}
