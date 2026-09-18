// #362 compatibility only; remove with the consumers below after #124/#139 parity.
// production: src/app/navigation/RootNavigator.tsx
// production: src/features/onboarding/OnboardingFlow.tsx
// test-only: src/features/onboarding/__tests__/OnboardingFlow.test.tsx
// Implementation: src/v2/modules/onboarding/preferences/screens/OnboardingPreferenceFlow.tsx
// Implementation: src/v2/modules/onboarding/preferences/hooks/useSyncOnboardingTravelSchedule.ts
// Direct named re-exports preserve the original function/component/object/type identity.
export { OnboardingPreferenceFlow, useSyncOnboardingTravelSchedule } from '../../modules/onboarding';
