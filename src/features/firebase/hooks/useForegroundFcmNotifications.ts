import { getApp } from '@react-native-firebase/app';
import { getMessaging, onMessage } from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import {
  configureForegroundNotifications,
  presentForegroundNotification,
} from '../utils/foregroundNotification';
import { ensureNotificationPermission } from '../utils/notificationPermission';

const messagingInstance = getMessaging(getApp());

export function useForegroundFcmNotifications(isLoggedIn: boolean): void {
  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    let canPresentNotification = false;

    const prepareNotifications = async () => {
      try {
        canPresentNotification = await ensureNotificationPermission();

        if (!canPresentNotification) {
          return;
        }

        await configureForegroundNotifications();
      } catch (error) {
        console.warn('Foreground notification setup failed:', error);
      }
    };

    void prepareNotifications();

    const unsubscribe = onMessage(messagingInstance, (remoteMessage) => {
      if (!canPresentNotification) {
        return;
      }

      void presentForegroundNotification(remoteMessage).catch((error) => {
        console.warn('Foreground notification present failed:', error);
      });
    });

    return unsubscribe;
  }, [isLoggedIn]);
}
