# #358 User file inventory and public API

Baseline: `793f0a2`, before any local edits. All implementation moves are V2.

## Before / after folders

| Before | Files | Implementation owner |
|---|---:|---|
| `features/account` | 8 | `modules/user/account` |
| `features/auth` | 4 | `modules/user/account/auth` |
| `features/my-page` | 40 | `modules/user/profile + profile/my-page` |
| `features/settings` | 23 | `modules/user/settings` |
| `features/notifications` | 25 | `modules/user/notifications` |
| `features/scout-profile` | 6 | `modules/user/scout-profile` |

## Exact file moves

Includes tests and development mock fixtures. Existing V1 compatibility files are listed separately in the handoff.

| Before | After |
|---|---|
| `src/v2/features/account/README.md` | `src/v2/modules/user/account/README.md` |
| `src/v2/features/account/api/accountApi.ts` | `src/v2/modules/user/account/api/accountApi.ts` |
| `src/v2/features/account/hooks/useAccount.ts` | `src/v2/modules/user/account/hooks/useAccount.ts` |
| `src/v2/features/account/index.ts` | `src/v2/modules/user/account/index.ts` |
| `src/v2/features/account/model/account.types.ts` | `src/v2/modules/user/account/model/account.types.ts` |
| `src/v2/features/account/model/accountQueryKeys.ts` | `src/v2/modules/user/account/model/accountQueryKeys.ts` |
| `src/v2/features/account/services/googleOAuth.ts` | `src/v2/modules/user/account/services/googleOAuth.ts` |
| `src/v2/features/account/services/userDataExport.ts` | `src/v2/modules/user/account/services/userDataExport.ts` |
| `src/v2/features/auth/api/authApi.ts` | `src/v2/modules/user/account/auth/api/authApi.ts` |
| `src/v2/features/auth/hooks/useAccountAuth.ts` | `src/v2/modules/user/account/auth/hooks/useAccountAuth.ts` |
| `src/v2/features/auth/index.ts` | `src/v2/modules/user/account/auth/index.ts` |
| `src/v2/features/auth/model/auth.types.ts` | `src/v2/modules/user/account/auth/model/auth.types.ts` |
| `src/v2/features/my-page/api/bookmarkApi.ts` | `src/v2/modules/user/profile/my-page/api/bookmarkApi.ts` |
| `src/v2/features/my-page/api/profileApi.ts` | `src/v2/modules/user/profile/api/profileApi.ts` |
| `src/v2/features/my-page/components/CouponCard.tsx` | `src/v2/modules/user/profile/my-page/coupons/components/CouponCard.tsx` |
| `src/v2/features/my-page/components/CouponCardSkeleton.tsx` | `src/v2/modules/user/profile/my-page/coupons/components/CouponCardSkeleton.tsx` |
| `src/v2/features/my-page/components/CouponQrCode.tsx` | `src/v2/modules/user/profile/my-page/coupons/components/CouponQrCode.tsx` |
| `src/v2/features/my-page/components/MyPageStatValue.tsx` | `src/v2/modules/user/profile/my-page/components/MyPageStatValue.tsx` |
| `src/v2/features/my-page/components/TravelCalendar.tsx` | `src/v2/modules/user/profile/my-page/travel/components/TravelCalendar.tsx` |
| `src/v2/features/my-page/components/VerifiedPlaceCard.tsx` | `src/v2/modules/user/profile/my-page/verified-places/components/VerifiedPlaceCard.tsx` |
| `src/v2/features/my-page/components/VerifiedPlaceCardSkeleton.tsx` | `src/v2/modules/user/profile/my-page/verified-places/components/VerifiedPlaceCardSkeleton.tsx` |
| `src/v2/features/my-page/components/__tests__/CouponQrCode.test.tsx` | `src/v2/modules/user/profile/my-page/coupons/components/__tests__/CouponQrCode.test.tsx` |
| `src/v2/features/my-page/components/__tests__/TravelCalendar.test.tsx` | `src/v2/modules/user/profile/my-page/travel/components/__tests__/TravelCalendar.test.tsx` |
| `src/v2/features/my-page/components/__tests__/VerifiedPlaceCard.test.tsx` | `src/v2/modules/user/profile/my-page/verified-places/components/__tests__/VerifiedPlaceCard.test.tsx` |
| `src/v2/features/my-page/data/index.ts` | `src/v2/modules/user/profile/data/index.ts` |
| `src/v2/features/my-page/hooks/__tests__/useBookmarks.test.tsx` | `src/v2/modules/user/profile/my-page/hooks/__tests__/useBookmarks.test.tsx` |
| `src/v2/features/my-page/hooks/__tests__/useToggleBookmarkRollback.test.tsx` | `src/v2/modules/user/profile/my-page/hooks/__tests__/useToggleBookmarkRollback.test.tsx` |
| `src/v2/features/my-page/hooks/useBookmarks.ts` | `src/v2/modules/user/profile/my-page/hooks/useBookmarks.ts` |
| `src/v2/features/my-page/hooks/useCouponBoxEntries.ts` | `src/v2/modules/user/profile/my-page/coupons/hooks/useCouponBoxEntries.ts` |
| `src/v2/features/my-page/hooks/useProfile.ts` | `src/v2/modules/user/profile/hooks/useProfile.ts` |
| `src/v2/features/my-page/model/__tests__/couponBoxEntries.test.ts` | `src/v2/modules/user/profile/my-page/coupons/model/__tests__/couponBoxEntries.test.ts` |
| `src/v2/features/my-page/model/__tests__/myPageTravel.test.ts` | `src/v2/modules/user/profile/my-page/travel/model/__tests__/myPageTravel.test.ts` |
| `src/v2/features/my-page/model/__tests__/verifiedPlaceEntries.test.ts` | `src/v2/modules/user/profile/my-page/verified-places/model/__tests__/verifiedPlaceEntries.test.ts` |
| `src/v2/features/my-page/model/__tests__/verifiedPlaceLayout.test.ts` | `src/v2/modules/user/profile/my-page/verified-places/model/__tests__/verifiedPlaceLayout.test.ts` |
| `src/v2/features/my-page/model/couponBoxEntries.ts` | `src/v2/modules/user/profile/my-page/coupons/model/couponBoxEntries.ts` |
| `src/v2/features/my-page/model/myPageTravel.ts` | `src/v2/modules/user/profile/my-page/travel/model/myPageTravel.ts` |
| `src/v2/features/my-page/model/profile.types.ts` | `src/v2/modules/user/profile/model/profile.types.ts` |
| `src/v2/features/my-page/model/profileQueryKeys.ts` | `src/v2/modules/user/profile/model/profileQueryKeys.ts` |
| `src/v2/features/my-page/model/verifiedPlaceEntries.ts` | `src/v2/modules/user/profile/my-page/verified-places/model/verifiedPlaceEntries.ts` |
| `src/v2/features/my-page/model/verifiedPlaceLayout.ts` | `src/v2/modules/user/profile/my-page/verified-places/model/verifiedPlaceLayout.ts` |
| `src/v2/features/my-page/profile/index.ts` | `src/v2/modules/user/profile/index.ts` |
| `src/v2/features/my-page/screens/CouponBoxScreen.tsx` | `src/v2/modules/user/profile/my-page/coupons/screens/CouponBoxScreen.tsx` |
| `src/v2/features/my-page/screens/CouponDetailContainer.tsx` | `src/v2/modules/user/profile/my-page/coupons/screens/CouponDetailContainer.tsx` |
| `src/v2/features/my-page/screens/CouponDetailScreen.tsx` | `src/v2/modules/user/profile/my-page/coupons/screens/CouponDetailScreen.tsx` |
| `src/v2/features/my-page/screens/MyPageScreen.tsx` | `src/v2/modules/user/profile/my-page/screens/MyPageScreen.tsx` |
| `src/v2/features/my-page/screens/ProfileEditScreen.tsx` | `src/v2/modules/user/profile/screens/ProfileEditScreen.tsx` |
| `src/v2/features/my-page/screens/VerifiedPlacesScreen.tsx` | `src/v2/modules/user/profile/my-page/verified-places/screens/VerifiedPlacesScreen.tsx` |
| `src/v2/features/my-page/screens/__tests__/CouponBoxScreen.test.tsx` | `src/v2/modules/user/profile/my-page/coupons/__tests__/CouponBoxScreen.test.tsx` |
| `src/v2/features/my-page/screens/__tests__/CouponDetailScreen.test.tsx` | `src/v2/modules/user/profile/my-page/coupons/__tests__/CouponDetailScreen.test.tsx` |
| `src/v2/features/my-page/screens/__tests__/MyPageScreen.test.tsx` | `src/v2/modules/user/profile/my-page/__tests__/MyPageScreen.test.tsx` |
| `src/v2/features/my-page/screens/__tests__/ProfileEditScreen.test.tsx` | `src/v2/modules/user/profile/__tests__/ProfileEditScreen.test.tsx` |
| `src/v2/features/my-page/screens/__tests__/VerifiedPlacesScreen.test.tsx` | `src/v2/modules/user/profile/my-page/verified-places/__tests__/VerifiedPlacesScreen.test.tsx` |
| `src/v2/features/notifications/api/notificationApi.ts` | `src/v2/modules/user/notifications/api/notificationApi.ts` |
| `src/v2/features/notifications/components/NotificationSettingToggle.tsx` | `src/v2/modules/user/notifications/components/NotificationSettingToggle.tsx` |
| `src/v2/features/notifications/data/index.ts` | `removed: notification-only tests now use internal contracts; mixed app test uses notifications/__tests__/index.ts` |
| `src/v2/features/notifications/hooks/__tests__/useNotificationSettings.test.tsx` | `src/v2/modules/user/notifications/hooks/__tests__/useNotificationSettings.test.tsx` |
| `src/v2/features/notifications/hooks/useFcmTokenMutations.ts` | `src/v2/modules/user/notifications/hooks/useFcmTokenMutations.ts` |
| `src/v2/features/notifications/hooks/useFcmTokenSync.ts` | `src/v2/modules/user/notifications/hooks/useFcmTokenSync.ts` |
| `src/v2/features/notifications/hooks/useForegroundNotifications.ts` | `src/v2/modules/user/notifications/hooks/useForegroundNotifications.ts` |
| `src/v2/features/notifications/hooks/useNotificationOpenSync.ts` | `src/v2/modules/user/notifications/hooks/useNotificationOpenSync.ts` |
| `src/v2/features/notifications/hooks/useNotificationSettings.ts` | `src/v2/modules/user/notifications/hooks/useNotificationSettings.ts` |
| `src/v2/features/notifications/index.ts` | `src/v2/modules/user/notifications/index.ts` |
| `src/v2/features/notifications/model/notification.types.ts` | `src/v2/modules/user/notifications/model/notification.types.ts` |
| `src/v2/features/notifications/model/notificationApi.types.ts` | `src/v2/modules/user/notifications/model/notificationApi.types.ts` |
| `src/v2/features/notifications/model/settingsPresentation.ts` | `src/v2/modules/user/notifications/model/settingsPresentation.ts` |
| `src/v2/features/notifications/screens/NotificationSettingsScreen.tsx` | `src/v2/modules/user/notifications/screens/NotificationSettingsScreen.tsx` |
| `src/v2/features/notifications/screens/__tests__/NotificationSettingsContract.test.tsx` | `src/v2/modules/user/notifications/__tests__/NotificationSettingsContract.test.tsx` |
| `src/v2/features/notifications/services/__tests__/foregroundNotification.test.ts` | `src/v2/modules/user/notifications/services/__tests__/foregroundNotification.test.ts` |
| `src/v2/features/notifications/services/__tests__/notificationPermission.test.ts` | `src/v2/modules/user/notifications/services/__tests__/notificationPermission.test.ts` |
| `src/v2/features/notifications/services/backgroundNotification.ts` | `src/v2/modules/user/notifications/services/backgroundNotification.ts` |
| `src/v2/features/notifications/services/fcmTokenLifecycle.ts` | `src/v2/modules/user/notifications/services/fcmTokenLifecycle.ts` |
| `src/v2/features/notifications/services/firebaseMessaging.ts` | `src/v2/modules/user/notifications/services/firebaseMessaging.ts` |
| `src/v2/features/notifications/services/foregroundNotification.ts` | `src/v2/modules/user/notifications/services/foregroundNotification.ts` |
| `src/v2/features/notifications/services/initialNotification.ts` | `src/v2/modules/user/notifications/services/initialNotification.ts` |
| `src/v2/features/notifications/services/notificationPayload.ts` | `src/v2/modules/user/notifications/services/notificationPayload.ts` |
| `src/v2/features/notifications/services/notificationPermission.ts` | `src/v2/modules/user/notifications/services/notificationPermission.ts` |
| `src/v2/features/notifications/services/notificationStorage.ts` | `src/v2/modules/user/notifications/services/notificationStorage.ts` |
| `src/v2/features/scout-profile/api/scoutProfileApi.ts` | `src/v2/modules/user/scout-profile/api/scoutProfileApi.ts` |
| `src/v2/features/scout-profile/hooks/useScoutProfile.ts` | `src/v2/modules/user/scout-profile/hooks/useScoutProfile.ts` |
| `src/v2/features/scout-profile/index.ts` | `src/v2/modules/user/scout-profile/index.ts` |
| `src/v2/features/scout-profile/model/scoutProfile.types.ts` | `src/v2/modules/user/scout-profile/model/scoutProfile.types.ts` |
| `src/v2/features/scout-profile/model/scoutProfileQueryKeys.ts` | `src/v2/modules/user/scout-profile/model/scoutProfileQueryKeys.ts` |
| `src/v2/features/scout-profile/model/scoutProfileSelectors.ts` | `src/v2/modules/user/scout-profile/model/scoutProfileSelectors.ts` |
| `src/v2/features/settings/components/AccountInformation.tsx` | `src/v2/modules/user/settings/components/AccountInformation.tsx` |
| `src/v2/features/settings/components/SettingsLayout.tsx` | `src/v2/modules/user/settings/components/SettingsLayout.tsx` |
| `src/v2/features/settings/hooks/useSettingsLogout.ts` | `src/v2/modules/user/settings/hooks/useSettingsLogout.ts` |
| `src/v2/features/settings/hooks/useSettingsNavigation.ts` | `src/v2/modules/user/settings/hooks/useSettingsNavigation.ts` |
| `src/v2/features/settings/index.ts` | `src/v2/modules/user/settings/index.ts` |
| `src/v2/features/settings/model/settings.types.ts` | `src/v2/modules/user/settings/model/settings.types.ts` |
| `src/v2/features/settings/model/settingsNavigation.ts` | `src/v2/modules/user/settings/model/settingsNavigation.ts` |
| `src/v2/features/settings/screens/AccountManagementScreen.tsx` | `src/v2/modules/user/settings/screens/AccountManagementScreen.tsx` |
| `src/v2/features/settings/screens/AppearanceSettingsScreen.tsx` | `src/v2/modules/user/settings/screens/AppearanceSettingsScreen.tsx` |
| `src/v2/features/settings/screens/DataExportScreen.tsx` | `src/v2/modules/user/settings/screens/DataExportScreen.tsx` |
| `src/v2/features/settings/screens/LanguageSettingsScreen.tsx` | `src/v2/modules/user/settings/screens/LanguageSettingsScreen.tsx` |
| `src/v2/features/settings/screens/LocationPrivacyScreen.tsx` | `src/v2/modules/user/settings/screens/LocationPrivacyScreen.tsx` |
| `src/v2/features/settings/screens/SettingsDetailPendingScreen.tsx` | `src/v2/modules/user/settings/screens/SettingsDetailPendingScreen.tsx` |
| `src/v2/features/settings/screens/SettingsDetailScreen.tsx` | `src/v2/modules/user/settings/screens/SettingsDetailScreen.tsx` |
| `src/v2/features/settings/screens/SettingsScreen.tsx` | `src/v2/modules/user/settings/screens/SettingsScreen.tsx` |
| `src/v2/features/settings/screens/__tests__/AccountSupport.test.tsx` | `src/v2/modules/user/settings/__tests__/AccountSupport.test.tsx` |
| `src/v2/features/settings/screens/__tests__/AppearanceSettingsScreen.test.tsx` | `src/v2/modules/user/settings/__tests__/AppearanceSettingsScreen.test.tsx` |
| `src/v2/features/settings/screens/__tests__/DataExport.test.tsx` | `src/v2/modules/user/settings/__tests__/DataExport.test.tsx` |
| `src/v2/features/settings/screens/__tests__/LocationPrivacy.test.tsx` | `src/v2/modules/user/settings/__tests__/LocationPrivacy.test.tsx` |
| `src/v2/features/settings/screens/__tests__/NotificationProduction.test.tsx` | `src/v2/app/testing/integration/__tests__/NotificationProduction.test.tsx` |
| `src/v2/features/settings/screens/__tests__/SettingsScreen.test.tsx` | `src/v2/modules/user/settings/__tests__/SettingsScreen.test.tsx` |
| `src/v2/features/settings/screens/__tests__/SettingsScreens.test.tsx` | `src/v2/modules/user/settings/__tests__/SettingsScreens.test.tsx` |
| `src/v2/features/settings/screens/__tests__/SettingsSupport.test.tsx` | `src/v2/modules/user/settings/__tests__/SettingsSupport.test.tsx` |
| `src/v2/features/voice-assistant/screens/__tests__/VoiceAssistantScreen.test.tsx` | `src/v2/app/testing/integration/__tests__/VoiceAssistantScreen.test.tsx` |
| `src/v2/shared/api/__tests__/accountSession.test.mjs` | `src/v2/modules/user/account/__tests__/accountSession.test.mjs` |
| `src/v2/shared/api/__tests__/mockApiClient.test.mjs` | `src/v2/app/testing/integration/__tests__/mockApiClient.test.mjs` |
| `src/v2/shared/api/__tests__/notificationContract.types.ts` | `src/v2/modules/user/notifications/__tests__/notificationContract.types.ts` |
| `src/v2/shared/api/__tests__/notificationSettingsApi.test.mjs` | `src/v2/modules/user/notifications/__tests__/notificationSettingsApi.test.mjs` |
| `src/v2/shared/api/__tests__/scoutProfile.contract.types.ts` | `src/v2/modules/user/scout-profile/__tests__/scoutProfile.contract.types.ts` |
| `src/v2/shared/api/__tests__/scoutProfile.test.mjs` | `src/v2/modules/user/scout-profile/__tests__/scoutProfile.test.mjs` |
| `src/v2/shared/api/__tests__/scoutProfileMock.test.mjs` | `src/v2/modules/user/scout-profile/__tests__/scoutProfileMock.test.mjs` |
| `src/v2/shared/api/mock/features/account/fixtures.ts` | `src/v2/modules/user/account/mock/fixtures.ts` |
| `src/v2/shared/api/mock/features/account/handlers.ts` | `src/v2/modules/user/account/mock/handlers.ts` |
| `src/v2/shared/api/mock/features/notifications/fixtures.ts` | `src/v2/modules/user/notifications/mock/fixtures.ts` |
| `src/v2/shared/api/mock/features/notifications/handlers.ts` | `src/v2/modules/user/notifications/mock/handlers.ts` |
| `src/v2/shared/api/mock/features/scout-profile/fixtures.ts` | `src/v2/modules/user/scout-profile/mock/fixtures.ts` |
| `src/v2/shared/api/mock/features/scout-profile/handlers.ts` | `src/v2/modules/user/scout-profile/mock/handlers.ts` |

## Exact public exports

Production indexes contain named exports only. `__tests__/index.ts` entries below are test support and are rejected as production dependencies.

### `src/v2/modules/user/account/__tests__/index.ts`

```ts
import * as userDataExportWriter from '../services/userDataExport';

export { userDataExportWriter };
```

### `src/v2/modules/user/account/auth/index.ts`

```ts
export { authApi, createAuthApi } from './api/authApi';
export {
  createEmailResendMutationOptions,
  createPasswordResetConfirmMutationOptions,
  createPasswordResetRequestMutationOptions,
  logoutAndClearSession,
  useLogout,
  usePasswordResetConfirm,
  usePasswordResetRequest,
  useResendVerificationEmail,
} from './hooks/useAccountAuth';
export type {
  EmailResendRequest,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
} from './model/auth.types';
```

### `src/v2/modules/user/account/index.ts`

```ts
export { accountApi, createAccountApi } from './api/accountApi';
export {
  createGoogleLinkMutationOptions,
  createGoogleUnlinkMutationOptions,
  createUserDataExportQueryOptions,
  downloadUserDataExport,
  refreshOAuthAccountQueries,
  shouldRefreshAfterOAuthReturn,
  useDownloadUserDataExport,
  useGoogleLink,
  useGoogleUnlink,
  useUserDataExport,
} from './hooks/useAccount';
export {
  accountUserQueryKeys,
  oauthAccountQueryKeys,
  userDataExportQueryKeys,
} from './model/accountQueryKeys';
export type {
  GoogleAccountResponse,
  GoogleLinkStartResponse,
  GoogleUnlinkRequest,
  UserDataExport,
} from './model/account.types';
export {
  openGoogleAuthorization,
  resolveGoogleAuthorizationUrl,
} from './services/googleOAuth';
export {
  createUserDataExportFileName,
  serializeUserDataExport,
  writeUserDataExport,
  writeUserDataExportForPlatform,
} from './services/userDataExport';
export type {
  ExportPlatform,
  ExportArtifact,
  PlatformExportWriters,
  UserDataExportWriter,
} from './services/userDataExport';
```

### `src/v2/modules/user/account/mock/index.ts`

```ts
export { accountMockHandlers } from './handlers';
```

### `src/v2/modules/user/index.ts`

```ts
export type { Profile } from './profile';
export type { NotificationRoute } from './notifications/routing';
export { myReviewsQueryKeys, profileQueryKeys } from './profile/data';
```

### `src/v2/modules/user/mock/index.ts`

```ts
// Development fixtures, composed by app; never imported by the shared transport.
export { accountMockHandlers } from '../account/mock';
export { notificationMockHandlers } from '../notifications/mock';
export { scoutProfileMockHandlers } from '../scout-profile/mock';
```

### `src/v2/modules/user/notifications/__tests__/index.ts`

```ts
export { notificationApi } from '../api/notificationApi';
export { createNotificationApi } from '../api/notificationApi';
```

### `src/v2/modules/user/notifications/background/index.ts`

```ts
export { registerBackgroundNotificationHandler } from '../services/backgroundNotification';
```

### `src/v2/modules/user/notifications/index.ts`

```ts
export {
  useDeleteFcmToken,
  useRegisterFcmToken,
} from './hooks/useFcmTokenMutations';
export {
  notificationSettingsQueryKeys,
  useNotificationSettings,
  useUpdateNotificationSettings,
} from './hooks/useNotificationSettings';
export type {
  FcmTokenRequest,
  NotificationSetting,
  NotificationSettingUpdateRequest,
} from './model/notificationApi.types';
export { default as NotificationSettingsScreen } from './screens/NotificationSettingsScreen';
export type {
  NotificationSettingsScreenProps,
} from './screens/NotificationSettingsScreen';
```

### `src/v2/modules/user/notifications/lifecycle/index.ts`

```ts
export { useFcmTokenSync } from '../hooks/useFcmTokenSync';
export { useForegroundNotifications } from '../hooks/useForegroundNotifications';
export { useNotificationOpenSync } from '../hooks/useNotificationOpenSync';
export { unregisterStoredFcmToken } from '../services/fcmTokenLifecycle';
```

### `src/v2/modules/user/notifications/mock/index.ts`

```ts
export { notificationMockHandlers } from './handlers';
```

### `src/v2/modules/user/notifications/routing/index.ts`

```ts
export type { NotificationRoute } from '../model/notification.types';
export { parseNotificationRoute } from '../services/notificationPayload';
export { selectInitialNotificationRoute } from '../services/initialNotification';
```

### `src/v2/modules/user/profile/__tests__/index.ts`

```ts
export { profileApi } from '../api/profileApi';
```

### `src/v2/modules/user/profile/data/index.ts`

```ts
export { myReviewsQueryKeys, profileQueryKeys } from '../model/profileQueryKeys';
```

### `src/v2/modules/user/profile/index.ts`

```ts
export { useProfile } from './hooks/useProfile';
export type { Profile } from './model/profile.types';
export { default as ProfileEditScreen } from './screens/ProfileEditScreen';
export { useMyReviews } from './hooks/useProfile';
```

### `src/v2/modules/user/profile/my-page/index.ts`

```ts
export { default as MyPageScreen } from './screens/MyPageScreen';
export { default as CouponBoxScreen } from './coupons/screens/CouponBoxScreen';
export { default as CouponDetailContainer } from './coupons/screens/CouponDetailContainer';
export { default as VerifiedPlacesScreen } from './verified-places/screens/VerifiedPlacesScreen';
```

### `src/v2/modules/user/scout-profile/index.ts`

```ts
export {
  createScoutProfileApi,
  scoutProfileApi,
} from './api/scoutProfileApi';
export {
  cacheScoutProfile,
  createApplyScoutProfileMutationOptions,
  createScoutProfileQueryOptions,
  createUpdateScoutProfileMutationOptions,
  useApplyScoutProfile,
  useScoutProfile,
  useUpdateScoutProfile,
} from './hooks/useScoutProfile';
export { scoutProfileQueryKeys } from './model/scoutProfileQueryKeys';
export {
  isScoutActivityEligible,
  isScoutProfileApiError,
  isScoutProfileNotFoundError,
} from './model/scoutProfileSelectors';
export {
  SCOUT_ACTIVITY_ELIGIBILITY_STATUS_VALUES,
  SCOUT_PROFILE_ERROR_CODES,
  SCOUT_PROFILE_STATUS_VALUES,
} from './model/scoutProfile.types';
export type {
  ScoutActivityEligibilityStatus,
  ScoutProfile,
  ScoutProfileErrorCode,
  ScoutProfileErrorResponse,
  ScoutProfileRequest,
  ScoutProfileStatus,
} from './model/scoutProfile.types';
```

### `src/v2/modules/user/scout-profile/mock/index.ts`

```ts
export { scoutProfileMockHandlers } from './handlers';
```

### `src/v2/modules/user/settings/index.ts`

```ts
export { default as SettingsDetailScreen } from './screens/SettingsDetailScreen';
export { default as AccountManagementScreen } from './screens/AccountManagementScreen';
export { default as LanguageSettingsScreen } from './screens/LanguageSettingsScreen';
export { default as SettingsDetailPendingScreen } from './screens/SettingsDetailPendingScreen';
export { default as SettingsScreen } from './screens/SettingsScreen';
export { default as AppearanceSettingsScreen } from './screens/AppearanceSettingsScreen';
export { SETTINGS_DETAIL_IDS } from './model/settings.types';
export type { SettingsDetailId } from './model/settings.types';
export { useSettingsNavigation, useSettingsDetailRedirect } from './hooks/useSettingsNavigation';
export { resolveSettingsDestination } from './model/settingsNavigation';
export type { SettingsDestination, UnsupportedSettingsDetail } from './model/settingsNavigation';
```
