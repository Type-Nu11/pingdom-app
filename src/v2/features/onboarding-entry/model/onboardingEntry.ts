// #362 compatibility only; remove with the consumers below after #124/#139 parity.
// test-only: src/app/navigation/__tests__/navigation.test.mjs
// test-only: src/app/navigation/__tests__/productionRoot.test.mjs
// Implementation: src/v2/modules/onboarding/entry/model/onboardingEntry.ts
// Direct named re-exports preserve the original function/component/object/type identity.
export { createOnboardingCompletion, getInitialAppRoute, getAuthInitialRoute, getUnauthenticatedNavigationKey } from '../../../modules/onboarding/entry/__tests__';
