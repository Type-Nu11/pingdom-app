import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

import type { NotificationRoute } from '../model/notification.types';
import {
  getFirebaseMessagingRuntime,
  type FirebaseRemoteMessage,
} from '../services/firebaseMessaging';
import { parseNotificationRoute } from '../services/notificationPayload';
import { selectInitialNotificationRoute } from '../services/initialNotification';
import { takeLastBackgroundNotification } from '../services/notificationStorage';

type NotificationOpenHandler = (route: NotificationRoute) => void;

export function useNotificationOpenSync(onOpen: NotificationOpenHandler): void {
  useEffect(() => {
    const firebaseMessaging = getFirebaseMessagingRuntime();

    const parseExpoNotification = (
      notification: Notifications.Notification,
      source: NotificationRoute['source'],
    ): NotificationRoute => {
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

      return parseNotificationRoute(message, source);
    };

    const hydrateInitialOpen = async () => {
      try {
        const [firebaseInitial, expoInitial, backgroundInitial] = await Promise.all([
          firebaseMessaging
            ? firebaseMessaging.getInitialNotification(firebaseMessaging.messaging)
            : Promise.resolve(null),
          Notifications.getLastNotificationResponseAsync(),
          takeLastBackgroundNotification(),
        ]);

        if (expoInitial) {
          await Notifications.clearLastNotificationResponseAsync();
        }

        const initialRoute = selectInitialNotificationRoute({
          background: backgroundInitial,
          expo: expoInitial ? parseExpoNotification(expoInitial.notification, 'quit-open') : null,
          firebase: firebaseInitial ? parseNotificationRoute(firebaseInitial, 'quit-open') : null,
        });
        if (initialRoute) onOpen(initialRoute);
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
      onOpen(parseExpoNotification(response.notification, 'foreground-open'));
      void Notifications.clearLastNotificationResponseAsync().catch(() => undefined);
    });

    return () => {
      unsubscribeFirebase?.();
      expoSubscription.remove();
    };
  }, [onOpen]);
}
