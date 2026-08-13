import { apiClient, type ApiClient } from '../../../shared/api';
import type {
  FcmTokenRequest,
  NotificationSetting,
  NotificationSettingUpdateRequest,
} from '../model/notificationApi.types';

const FCM_TOKENS_PATH = '/firebase/fcm-tokens';
const LEGACY_FCM_TOKEN_PATH = '/firebase/fcm-token';
const NOTIFICATION_SETTINGS_PATH = '/notifications/settings';

export type UpdateFcmTokenRequest = FcmTokenRequest;

export function createNotificationApi(client: ApiClient = apiClient) {
  const pendingRegistrations = new Map<string, Promise<void>>();
  const pendingDeletions = new Map<string, Promise<void>>();

  const runTokenRequestOnce = (
    requests: Map<string, Promise<void>>,
    token: string,
    request: () => Promise<void>,
  ) => {
    const pending = requests.get(token);
    if (pending) return pending;

    const next = request().finally(() => {
      if (requests.get(token) === next) requests.delete(token);
    });
    requests.set(token, next);
    return next;
  };

  return {
    deleteFcmToken: (body: FcmTokenRequest, signal?: AbortSignal): Promise<void> =>
      runTokenRequestOnce(pendingDeletions, body.token, async () => {
        // If logout races the initial POST or a refresh callback, preserve server order:
        // finish registration first, then remove that exact token.
        const pendingRegistration = pendingRegistrations.get(body.token);
        if (pendingRegistration) await pendingRegistration.catch(() => undefined);
        await client.delete<void, FcmTokenRequest>(FCM_TOKENS_PATH, body, { signal });
      }),
    getNotificationSettings: (signal?: AbortSignal): Promise<NotificationSetting> =>
      client.get<NotificationSetting>(NOTIFICATION_SETTINGS_PATH, { signal }),
    registerFcmToken: (body: FcmTokenRequest, signal?: AbortSignal): Promise<void> =>
      // The server contract explicitly permits registration and re-registration. The
      // local guard only coalesces concurrent requests for the same device token.
      runTokenRequestOnce(pendingRegistrations, body.token, async () => {
        await client.post<void, FcmTokenRequest>(FCM_TOKENS_PATH, body, { signal });
      }),
    updateLegacyFcmToken: async (
      body: FcmTokenRequest,
      signal?: AbortSignal,
    ): Promise<void> => {
      await client.patch<void, FcmTokenRequest>(LEGACY_FCM_TOKEN_PATH, body, { signal });
    },
    updateNotificationSettings: (
      body: NotificationSettingUpdateRequest,
      signal?: AbortSignal,
    ): Promise<NotificationSetting> =>
      client.patch<NotificationSetting, NotificationSettingUpdateRequest>(
        NOTIFICATION_SETTINGS_PATH,
        body,
        { signal },
      ),
  };
}

export const notificationApi = createNotificationApi();

/**
 * @deprecated The server OpenAPI marks PATCH /firebase/fcm-token as a temporary
 * compatibility endpoint. Keep this export until the server publishes a sunset date.
 */
export async function updateFcmToken(payload: UpdateFcmTokenRequest): Promise<void> {
  await notificationApi.updateLegacyFcmToken(payload);
}
