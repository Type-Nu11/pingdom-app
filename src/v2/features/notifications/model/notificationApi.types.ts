import type {
  components,
  operations,
} from '../../../shared/api/generated/notifications';

export type FcmTokenRequest = components['schemas']['FcmTokenRequest'];
export type NotificationSettingUpdateRequest =
  components['schemas']['NotificationSettingUpdateRequest'];
export type NotificationSetting =
  operations['getSetting']['responses'][200]['content']['*/*'];
