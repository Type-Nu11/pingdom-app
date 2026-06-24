import { api } from '../../../shared/api/apiClient';

export type UpdateFcmTokenRequest = {
  token: string;
};

export async function updateFcmToken(payload: UpdateFcmTokenRequest): Promise<void> {
  await api.patch('/firebase/fcm-token', payload);
}
