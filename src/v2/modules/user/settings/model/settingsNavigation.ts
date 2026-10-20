import type { SettingsDetailId } from './settings.types';

export type UnsupportedSettingsDetail =
  | 'appInformation' | 'deleteAccount' | 'footprintMap' | 'myRecords'
  | 'notices' | 'privacyPolicy' | 'savedPlaces' | 'terms';

export type SettingsDestination =
  | { kind: 'route'; route: 'ProfileEdit' | 'AccountManagement' | 'CouponBox' | 'NotificationSettings' }
  | { kind: 'detail'; detail: 'dataManagement' | 'loginInformation' | 'locationSettings' | 'privacySettings' }
  | { kind: 'unsupported'; detail: UnsupportedSettingsDetail }
  | { kind: 'logout' };

export function resolveSettingsDestination(detail: SettingsDetailId): SettingsDestination {
  switch (detail) {
    case 'profileEdit':
    case 'passwordChange': return { kind: 'route', route: 'ProfileEdit' };
    case 'accountManagement': return { kind: 'route', route: 'AccountManagement' };
    case 'coupons': return { kind: 'route', route: 'CouponBox' };
    case 'notificationSettings': return { kind: 'route', route: 'NotificationSettings' };
    case 'logout': return { kind: 'logout' };
    case 'dataManagement':
    case 'loginInformation':
    case 'locationSettings':
    case 'privacySettings': return { kind: 'detail', detail };
    default: return { kind: 'unsupported', detail };
  }
}
