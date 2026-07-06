import { useEffect, useState } from 'react';
import {
  configureForegroundNotifications,
  presentForegroundNotification,
} from '../utils/foregroundNotification';
import { getFirebaseMessagingRuntime } from '../utils/firebaseMessaging';
import { ensureNotificationPermission } from '../utils/notificationPermission';

export function useForegroundFcmNotifications(isLoggedIn: boolean): void {
  const [canPresentNotification, setCanPresentNotification] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setCanPresentNotification(false);
      return;
    }

    let isMounted = true;

    const prepareNotifications = async () => {
      try {
        const hasPermission = await ensureNotificationPermission();

        if (!isMounted) {
          return;
        }

        setCanPresentNotification(hasPermission);

        if (!hasPermission) {
          return;
        }

        await configureForegroundNotifications();
      } catch (error) {
        console.warn('Foreground notification setup failed:', error);
      }
    };

    void prepareNotifications();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !canPresentNotification) {
      return;
    }

    const firebaseMessaging = getFirebaseMessagingRuntime();

    if (!firebaseMessaging) {
      return;
    }

    const unsubscribe = firebaseMessaging.onMessage(firebaseMessaging.messaging, (remoteMessage) => {
      void presentForegroundNotification(remoteMessage).catch((error) => {
        console.warn('Foreground notification present failed:', error);
      });
    });

    return unsubscribe;
  }, [canPresentNotification, isLoggedIn]);
}
