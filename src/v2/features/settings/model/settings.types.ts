export const SETTINGS_DETAIL_IDS = {
  AppInformation: 'appInformation',
  Coupons: 'coupons',
  DataManagement: 'dataManagement',
  DeleteAccount: 'deleteAccount',
  FootprintMap: 'footprintMap',
  LocationSettings: 'locationSettings',
  LoginInformation: 'loginInformation',
  Logout: 'logout',
  MyRecords: 'myRecords',
  Notices: 'notices',
  NotificationSettings: 'notificationSettings',
  PasswordChange: 'passwordChange',
  PrivacyPolicy: 'privacyPolicy',
  PrivacySettings: 'privacySettings',
  SavedPlaces: 'savedPlaces',
  Terms: 'terms',
} as const;

export type SettingsDetailId = typeof SETTINGS_DETAIL_IDS[keyof typeof SETTINGS_DETAIL_IDS];
