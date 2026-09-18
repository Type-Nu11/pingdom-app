import { notificationApi } from '../api/notificationApi';
import {
  clearRegisteredFcmToken,
  getRegisteredFcmToken,
} from './notificationStorage';

export async function unregisterStoredFcmToken(): Promise<void> {
  const token = await getRegisteredFcmToken();
  if (!token) return;

  await notificationApi.deleteFcmToken({ token });
  await clearRegisteredFcmToken(token);
}
