import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import {
  configureForegroundNotifications,
  presentForegroundNotification,
} from '../utils/foregroundNotification';
import { ensureNotificationPermission } from '../utils/notificationPermission';

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

    const unsubscribe = messaging().onMessage((remoteMessage) => {
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
