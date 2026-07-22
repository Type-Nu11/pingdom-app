import { useEffect } from 'react';

import {
  configureForegroundNotifications,
  presentForegroundNotification,
} from '../services/foregroundNotification';
import { getFirebaseMessagingRuntime } from '../services/firebaseMessaging';
import { ensureNotificationPermission } from '../services/notificationPermission';

export function useForegroundNotifications(enabled = true): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const firebaseMessaging = getFirebaseMessagingRuntime();

    if (!firebaseMessaging) {
      return;
    }

    let unsubscribe: (() => void) | undefined;
    let isMounted = true;

    const subscribe = async () => {
      try {
        if (!await ensureNotificationPermission() || !isMounted) {
          return;
        }

        await configureForegroundNotifications();

        if (!isMounted) {
          return;
        }

        unsubscribe = firebaseMessaging.onMessage(firebaseMessaging.messaging, (message) => {
          void presentForegroundNotification(message).catch((error) => {
            console.warn('[V2 FCM] Foreground notification failed:', error);
          });
        });
      } catch (error) {
        console.warn('[V2 FCM] Foreground setup failed:', error);
      }
    };

    void subscribe();

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [enabled]);
}
