import type { components } from '../../../generated/notifications';
import type { MockHandler } from '../../handlers';
import { notificationSettingFixture } from './fixtures';

const FCM_TOKENS_PATH = '/firebase/fcm-tokens';
const NOTIFICATION_SETTINGS_PATH = '/notifications/settings';

let notificationSetting: components['schemas']['NotificationSettingResponse'] = {
  ...notificationSettingFixture,
};

export const notificationMockHandlers = [
  {
    method: 'POST',
    path: FCM_TOKENS_PATH,
    resolve: () => undefined,
  },
  {
    method: 'DELETE',
    path: FCM_TOKENS_PATH,
    resolve: () => undefined,
  },
  {
    method: 'GET',
    path: NOTIFICATION_SETTINGS_PATH,
    resolve: () => notificationSetting,
  },
  {
    method: 'PATCH',
    path: NOTIFICATION_SETTINGS_PATH,
    resolve: ({ body }) => {
      notificationSetting = {
        ...notificationSetting,
        ...(body as components['schemas']['NotificationSettingUpdateRequest']),
      };
      return notificationSetting;
    },
  },
] satisfies readonly MockHandler[];
