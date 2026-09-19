// #362 compatibility only; remove with the consumers below after #124/#139 parity.
// production: src/app/navigation/MainNavigator.tsx
// production: src/app/navigation/types.ts
// Implementation: src/v2/modules/user/settings/screens/AccountManagementScreen.tsx
// Implementation: src/v2/modules/user/settings/screens/SettingsDetailScreen.tsx
// Implementation: src/v2/modules/user/settings/model/settings.types.ts
// Direct named re-exports preserve the original function/component/object/type identity.
export { AccountManagementScreen, SettingsDetailScreen, SETTINGS_DETAIL_IDS } from '../../modules/user/settings';
export type { SettingsDetailId } from '../../modules/user/settings';
