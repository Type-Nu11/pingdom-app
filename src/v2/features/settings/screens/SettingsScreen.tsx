// #362 compatibility only; remove with the consumers below after #124/#139 parity.
// production: src/app/navigation/MainNavigator.tsx
// test-only: src/app/navigation/__tests__/MainNavigator.test.tsx
// Implementation: src/v2/modules/user/settings/screens/SettingsScreen.tsx
// Direct named re-exports preserve the original function/component/object/type identity.
export { SettingsScreen as default } from '../../../modules/user/settings';
