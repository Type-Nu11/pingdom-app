import { apiClient } from '../../../shared/api';

export type UpdateFcmTokenRequest = {
  token: string;
};

export async function updateFcmToken(payload: UpdateFcmTokenRequest): Promise<void> {
  await apiClient.patch<void, UpdateFcmTokenRequest>('/firebase/fcm-token', payload);
}
