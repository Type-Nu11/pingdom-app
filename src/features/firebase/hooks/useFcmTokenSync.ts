import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  getToken,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
} from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import { updateFcmToken } from '../api/firebaseApi';
import { ensureNotificationPermission } from '../utils/notificationPermission';

const messagingInstance = getMessaging(getApp());

async function syncFcmToken(token: string): Promise<void> {
  await updateFcmToken({ token });
}

async function getCurrentFcmToken(): Promise<string | null> {
  const hasPermission = await ensureNotificationPermission();

  if (!hasPermission) {
    return null;
  }

  try {
    await registerDeviceForRemoteMessages(messagingInstance);
  } catch {
    // 이미 등록된 기기에서는 예외가 날 수 있어 무시합니다.
  }

  const token = await getToken(messagingInstance);
  return token || null;
}

export function useFcmTokenSync(isLoggedIn: boolean): void {
  useEffect(() => {
    if (!isLoggedIn) {
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

    const unsubscribe = onTokenRefresh(messagingInstance, (token) => {
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
