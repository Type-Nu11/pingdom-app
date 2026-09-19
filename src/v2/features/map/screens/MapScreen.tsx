// #362 compatibility only; remove with the consumers below after #124/#139 parity.
// production: src/app/navigation/MainNavigator.tsx
// test-only: src/app/navigation/__tests__/MainNavigator.test.tsx
// test-only: src/app/navigation/__tests__/SettingsNavigation.test.tsx
// Implementation: src/v2/modules/place/map/screens/MapScreen.tsx
// Direct named re-exports preserve the original function/component/object/type identity.
export { MapScreen as default } from '../../../modules/place/map';
