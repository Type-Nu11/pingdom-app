import type { components, operations } from '../generated/notifications';
import type {
  FcmTokenRequest,
  NotificationSetting,
  NotificationSettingUpdateRequest,
} from '../../../features/notifications/model/notificationApi.types';

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? true
    : false;
type Assert<Condition extends true> = Condition;

type FcmTokenRequestMatchesOperation = Assert<
  Equal<
    FcmTokenRequest,
    operations['registerFcmToken']['requestBody']['content']['application/json']
  >
>;
type DeleteFcmTokenRequestMatchesOperation = Assert<
  Equal<
    FcmTokenRequest,
    operations['deleteFcmToken']['requestBody']['content']['application/json']
  >
>;
type NotificationSettingMatchesOperation = Assert<
  Equal<
    NotificationSetting,
    operations['getSetting']['responses'][200]['content']['*/*']
  >
>;
type NotificationSettingUpdateMatchesOperation = Assert<
  Equal<
    NotificationSettingUpdateRequest,
    operations['updateSetting']['requestBody']['content']['application/json']
  >
>;
type NotificationSettingUpdateMatchesSchema = Assert<
  Equal<
    NotificationSettingUpdateRequest,
    components['schemas']['NotificationSettingUpdateRequest']
  >
>;

export type NotificationContractTypeAssertions =
  | FcmTokenRequestMatchesOperation
  | DeleteFcmTokenRequestMatchesOperation
  | NotificationSettingMatchesOperation
  | NotificationSettingUpdateMatchesOperation
  | NotificationSettingUpdateMatchesSchema;
