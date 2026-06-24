import { useEffect } from 'react';
import {
  setLastBackgroundNotificationRoute,
  setPendingNotificationRoute,
} from '../../../app/store/notificationStore';
import { getFirebaseMessagingRuntime } from '../utils/firebaseMessaging';
import { parseNotificationRoute } from '../utils/notificationPayload';
import {
  clearLastBackgroundNotification,
  getLastBackgroundNotification,
} from '../utils/notificationStorage';

export function useNotificationOpenSync(): void {
  useEffect(() => {
    const firebaseMessaging = getFirebaseMessagingRuntime();

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
      if (!firebaseMessaging) {
        return;
      }

      try {
        const initialMessage = await firebaseMessaging.getInitialNotification(
          firebaseMessaging.messaging
        );

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

    if (!firebaseMessaging) {
      return undefined;
    }

    const unsubscribe = firebaseMessaging.onNotificationOpenedApp(firebaseMessaging.messaging, (remoteMessage) => {
      setPendingNotificationRoute(parseNotificationRoute(remoteMessage, 'background-open'));
    });

    return unsubscribe;
  }, []);
}
