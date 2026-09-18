// #362 compatibility only; remove with the consumers below after #124/#139 parity.
// test-only: src/app/navigation/__tests__/MainNavigator.test.tsx
// test-only: src/app/navigation/__tests__/SettingsNavigation.test.tsx
// test-only: src/v2/shared/components/__tests__/FavoriteIcon.test.tsx
// test-only: src/v2/shared/components/__tests__/HeaderBackButton.test.tsx
// test-only: src/v2/shared/components/__tests__/TypographyComponents.test.tsx
// test-only: src/v2/shared/i18n/__tests__/placeActions.test.ts
// Implementation: src/v2/app/testing/testProviders.tsx
// Direct named re-exports preserve the original function/component/object/type identity.
export { createTestI18n, renderWithProviders } from '../../app/testing/testProviders';
