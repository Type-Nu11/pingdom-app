import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

import type { NotificationRoute } from '../model/notification.types';
import {
  getFirebaseMessagingRuntime,
  type FirebaseRemoteMessage,
} from '../services/firebaseMessaging';
import { parseNotificationRoute } from '../services/notificationPayload';

type NotificationOpenHandler = (route: NotificationRoute) => void;

export function useNotificationOpenSync(onOpen: NotificationOpenHandler): void {
  useEffect(() => {
    const firebaseMessaging = getFirebaseMessagingRuntime();

    const handleExpoNotification = (
      notification: Notifications.Notification,
      source: NotificationRoute['source'],
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

      onOpen(parseNotificationRoute(message, source));
    };

    const hydrateInitialOpen = async () => {
      try {
        const [firebaseInitial, expoInitial] = await Promise.all([
          firebaseMessaging
            ? firebaseMessaging.getInitialNotification(firebaseMessaging.messaging)
            : Promise.resolve(null),
          Notifications.getLastNotificationResponseAsync(),
        ]);

        if (expoInitial) {
          await Notifications.clearLastNotificationResponseAsync();
        }

        if (firebaseInitial) {
          onOpen(parseNotificationRoute(firebaseInitial, 'quit-open'));
        } else if (expoInitial) {
          handleExpoNotification(expoInitial.notification, 'quit-open');
        }
      } catch (error) {
        console.warn('[V2 FCM] Initial notification handling failed:', error);
      }
    };

    void hydrateInitialOpen();

    const unsubscribeFirebase = firebaseMessaging
      ? firebaseMessaging.onNotificationOpenedApp(firebaseMessaging.messaging, (message) => {
        onOpen(parseNotificationRoute(message, 'background-open'));
      })
      : undefined;
    const expoSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      handleExpoNotification(response.notification, 'foreground-open');
      void Notifications.clearLastNotificationResponseAsync().catch(() => undefined);
    });

    return () => {
      unsubscribeFirebase?.();
      expoSubscription.remove();
    };
  }, [onOpen]);
}
