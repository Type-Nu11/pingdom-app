import { useMutation } from '@tanstack/react-query';

import { notificationApi } from '../api/notificationApi';
import type { FcmTokenRequest } from '../model/notificationApi.types';
import {
  clearRegisteredFcmToken,
  saveRegisteredFcmToken,
} from '../services/notificationStorage';

type NotificationApi = typeof notificationApi;

export function createRegisterFcmTokenMutationOptions(
  api: Pick<NotificationApi, 'registerFcmToken'> = notificationApi,
) {
  return {
    mutationFn: (body: FcmTokenRequest) => api.registerFcmToken(body),
  };
}

export function createDeleteFcmTokenMutationOptions(
  api: Pick<NotificationApi, 'deleteFcmToken'> = notificationApi,
) {
  return {
    mutationFn: (body: FcmTokenRequest) => api.deleteFcmToken(body),
  };
}

export function useRegisterFcmToken() {
  return useMutation({
    ...createRegisterFcmTokenMutationOptions(),
    onMutate: async ({ token }) => {
      try {
        await saveRegisteredFcmToken(token);
      } catch (error) {
        console.warn('[V2 FCM] Registered token persistence failed:', error);
      }
    },
  });
}

export function useDeleteFcmToken() {
  return useMutation({
    ...createDeleteFcmTokenMutationOptions(),
    onSuccess: (_response, { token }) => {
      void clearRegisteredFcmToken(token).catch((error) => {
        console.warn('[V2 FCM] Registered token cleanup failed:', error);
      });
    },
  });
}
