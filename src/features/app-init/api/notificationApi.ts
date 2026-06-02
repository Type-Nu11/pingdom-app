import { api } from '../../../shared/api/apiClient';

export type UpdateFcmTokenRequest = {
  token: string;
};

export const notificationApi = {
  updateFcmToken: async (payload: UpdateFcmTokenRequest): Promise<void> => {
    await api.patch('/firebase/fcm-token', payload);
  },
};
