import { getApp } from '@react-native-firebase/app';
import { getMessaging, onMessage } from '@react-native-firebase/messaging';
import { useEffect, useState } from 'react';
import {
  configureForegroundNotifications,
  presentForegroundNotification,
} from '../utils/foregroundNotification';
import { ensureNotificationPermission } from '../utils/notificationPermission';

const messagingInstance = getMessaging(getApp());

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

    const unsubscribe = onMessage(messagingInstance, (remoteMessage) => {
      void presentForegroundNotification(remoteMessage).catch((error) => {
        console.warn('Foreground notification present failed:', error);
      });
    });

    return unsubscribe;
  }, [canPresentNotification, isLoggedIn]);
}
