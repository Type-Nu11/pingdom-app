// #362 compatibility only; remove with the consumers below after #124/#139 parity.
// production: src/app/navigation/AuthNavigator.tsx
// production: src/app/navigation/RootNavigator.tsx
// production: src/features/onboarding/OnboardingFlow.tsx
// Implementation: src/v2/modules/onboarding/entry/hooks/useOnboardingEntry.ts
// Implementation: src/v2/modules/onboarding/entry/model/onboardingEntry.ts
// Direct named re-exports preserve the original function/component/object/type identity.
export { useOnboardingEntry, getInitialAppRoute, getAuthInitialRoute, getUnauthenticatedNavigationKey } from '../../modules/onboarding';
export type { OnboardingCompletion, OnboardingEntryState, SignupOnboardingContext } from '../../modules/onboarding';
