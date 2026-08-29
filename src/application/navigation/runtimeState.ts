import type { OnboardingEntryState } from '../../v2/features/onboarding-entry';

export type ProductionRootState = 'auth' | 'loading' | 'main' | 'onboarding';

export function resolveProductionRootState(
  isAuthHydrating: boolean,
  isLoggedIn: boolean,
  onboardingState: OnboardingEntryState,
): ProductionRootState {
  if (isAuthHydrating || onboardingState.kind === 'hydrating') return 'loading';
  if (isLoggedIn) return 'main';
  return onboardingState.kind === 'completed' ? 'auth' : 'onboarding';
}

export function canDeliverProtectedIntent(
  rootState: ProductionRootState,
  isNavigationReady: boolean,
): boolean {
  return rootState === 'main' && isNavigationReady;
}
