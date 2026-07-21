import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import {
  setLastBackgroundNotificationRoute,
  setPendingNotificationRoute,
} from '../../../app/store/notificationStore';
import { getFirebaseMessagingRuntime } from '../utils/firebaseMessaging';
import type { FirebaseRemoteMessage } from '../utils/firebaseMessaging';
import { parseNotificationRoute } from '../utils/notificationPayload';
import {
  clearLastBackgroundNotification,
  getLastBackgroundNotification,
} from '../utils/notificationStorage';

export function useNotificationOpenSync(): void {
  useEffect(() => {
    const firebaseMessaging = getFirebaseMessagingRuntime();

    const routeExpoNotification = (
      notification: Notifications.Notification,
      source: 'local-open' | 'quit-open',
    ) => {
      const { content } = notification.request;
      const data = content.data ?? {};
      const message: FirebaseRemoteMessage = {
        data,
        messageId: typeof data.messageId === 'string'
          ? data.messageId
          : notification.request.identifier,
        notification: {
          body: content.body ?? undefined,
          title: content.title ?? undefined,
        },
      };

      setPendingNotificationRoute(parseNotificationRoute(message, source));
    };

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

    const hydrateInitialExpoNotification = async () => {
      try {
        const response = await Notifications.getLastNotificationResponseAsync();

        if (!response) {
          return;
        }

        routeExpoNotification(response.notification, 'quit-open');
        await Notifications.clearLastNotificationResponseAsync();
      } catch (error) {
        console.warn('Initial local notification hydrate failed:', error);
      }
    };

    void hydrateBackgroundRoute();
    void hydrateInitialNotification();
    void hydrateInitialExpoNotification();

    const unsubscribeFirebase = firebaseMessaging
      ? firebaseMessaging.onNotificationOpenedApp(firebaseMessaging.messaging, (remoteMessage) => {
        setPendingNotificationRoute(parseNotificationRoute(remoteMessage, 'background-open'));
      })
      : undefined;
    const expoSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      routeExpoNotification(response.notification, 'local-open');
      void Notifications.clearLastNotificationResponseAsync();
    });

    return () => {
      unsubscribeFirebase?.();
      expoSubscription.remove();
    };
  }, []);
}
