import type { OnboardingEntryState } from '../../v2/modules/onboarding';

export type ProductionRootState = 'auth' | 'loading' | 'main' | 'onboarding';

export function resolveProductionRootState(
  isAuthHydrating: boolean,
  isLoggedIn: boolean,
  onboardingState: OnboardingEntryState,
  hasAuthenticated = false,
): ProductionRootState {
  if (isAuthHydrating || onboardingState.kind === 'hydrating') return 'loading';
  if (isLoggedIn) return 'main';
  return onboardingState.kind === 'completed' || hasAuthenticated ? 'auth' : 'onboarding';
}

export function canDeliverProtectedIntent(
  rootState: ProductionRootState,
  isNavigationReady: boolean,
): boolean {
  return rootState === 'main' && isNavigationReady;
}
