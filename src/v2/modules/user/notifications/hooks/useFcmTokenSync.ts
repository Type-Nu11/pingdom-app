import { useEffect } from 'react';

import { useRegisterFcmToken } from './useFcmTokenMutations';
import { getFirebaseMessagingRuntime } from '../services/firebaseMessaging';
import { ensureNotificationPermission } from '../services/notificationPermission';

export function useFcmTokenSync(enabled = true): void {
  const registerToken = useRegisterFcmToken();

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
          await registerToken.mutateAsync({ token });
        }
      } catch {
        console.warn('[V2 FCM] Token registration failed.');
      }
    };

    void registerCurrentToken();

    const unsubscribe = firebaseMessaging.onTokenRefresh(
      firebaseMessaging.messaging,
      (token) => {
        void registerToken.mutateAsync({ token }).catch(() => {
          console.warn('[V2 FCM] Token refresh failed.');
        });
      },
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [enabled, registerToken.mutateAsync]);
}
