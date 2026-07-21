import { useEffect } from 'react';

import { updateFcmToken } from '../api/notificationApi';
import { getFirebaseMessagingRuntime } from '../services/firebaseMessaging';
import { ensureNotificationPermission } from '../services/notificationPermission';

export function useFcmTokenSync(enabled = true): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const firebaseMessaging = getFirebaseMessagingRuntime();

    if (!firebaseMessaging) {
      return;
    }

    let isMounted = true;

    const registerCurrentToken = async () => {
      try {
        if (!await ensureNotificationPermission()) {
          return;
        }

        try {
          await firebaseMessaging.registerDeviceForRemoteMessages(firebaseMessaging.messaging);
        } catch {
          // The device may already be registered.
        }

        const token = await firebaseMessaging.getToken(firebaseMessaging.messaging);

        if (isMounted && token) {
          await updateFcmToken({ token });
        }
      } catch (error) {
        console.warn('[V2 FCM] Token registration failed:', error);
      }
    };

    void registerCurrentToken();

    const unsubscribe = firebaseMessaging.onTokenRefresh(
      firebaseMessaging.messaging,
      (token) => {
        void updateFcmToken({ token }).catch((error) => {
          console.warn('[V2 FCM] Token refresh failed:', error);
        });
      },
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [enabled]);
}
