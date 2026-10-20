import { useEffect } from 'react';
import { updateFcmToken } from '../api/firebaseApi';
import { getFirebaseMessagingRuntime } from '../utils/firebaseMessaging';
import { getCurrentFcmToken } from '../utils/getCurrentFcmToken';

async function syncFcmToken(token: string): Promise<void> {
  await updateFcmToken({ token });
}

export function useFcmTokenSync(isLoggedIn: boolean): void {
  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const firebaseMessaging = getFirebaseMessagingRuntime();

    if (!firebaseMessaging) {
      return;
    }

    let isMounted = true;

    const syncCurrentToken = async () => {
      try {
        const token = await getCurrentFcmToken();

        if (!isMounted || !token) {
          return;
        }

        await syncFcmToken(token);
      } catch (error) {
        console.warn('FCM token sync failed:', error);
      }
    };

    void syncCurrentToken();

    const unsubscribe = firebaseMessaging.onTokenRefresh(firebaseMessaging.messaging, (token) => {
      void syncFcmToken(token).catch((error) => {
        console.warn('FCM token refresh sync failed:', error);
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isLoggedIn]);
}
