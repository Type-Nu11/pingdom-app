import messaging from '@react-native-firebase/messaging';
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
        const initialMessage = await messaging().getInitialNotification();

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

    const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
      setPendingNotificationRoute(parseNotificationRoute(remoteMessage, 'background-open'));
    });

    return unsubscribe;
  }, []);
}
