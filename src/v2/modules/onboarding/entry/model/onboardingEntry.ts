export const ONBOARDING_COMPLETION_VERSION = 1 as const;

export const SUPPORTED_ONBOARDING_LANGUAGES = [
  'en',
  'ko',
  'ja',
  'zh',
  'vi',
  'th',
] as const;

export const SUPPORTED_ONBOARDING_COUNTRIES = [
  'US',
  'CN',
  'JP',
  'TH',
  'VN',
  'KR',
] as const;

export type OnboardingLanguage = typeof SUPPORTED_ONBOARDING_LANGUAGES[number];
export type OnboardingCountry = typeof SUPPORTED_ONBOARDING_COUNTRIES[number];
export type AuthEntryVariant = 'foreign' | 'kr';

export type SignupOnboardingContext = Readonly<{
  birthYear: number;
  country: OnboardingCountry;
  entryVariant: AuthEntryVariant;
  language: OnboardingLanguage;
}>;

export type OnboardingCompletion = Readonly<{
  completed: true;
  signupContext: SignupOnboardingContext;
  version: typeof ONBOARDING_COMPLETION_VERSION;
}>;

export type OnboardingEntryState =
  | Readonly<{ kind: 'hydrating' }>
  | Readonly<{ error?: Error; kind: 'incomplete' }>
  | Readonly<{ completion: OnboardingCompletion; kind: 'completed' }>;

export type InitialAppRoute = 'loading' | 'main' | 'onboarding' | 'auth-landing';
export type AuthInitialRoute = 'AuthLanding' | 'Onboarding';

export function getInitialAppRoute(
  isAuthHydrating: boolean,
  isLoggedIn: boolean,
  onboardingState: OnboardingEntryState,
): InitialAppRoute {
  if (isAuthHydrating || onboardingState.kind === 'hydrating') return 'loading';
  if (isLoggedIn) return 'main';
  return onboardingState.kind === 'completed' ? 'auth-landing' : 'onboarding';
}

export function getAuthInitialRoute(
  completion?: OnboardingCompletion,
): AuthInitialRoute {
  return completion ? 'AuthLanding' : 'Onboarding';
}

export function getUnauthenticatedNavigationKey(
  completion?: OnboardingCompletion,
): 'unauthenticated-completed' | 'unauthenticated-incomplete' {
  return completion ? 'unauthenticated-completed' : 'unauthenticated-incomplete';
}

export function createOnboardingCompletion(
  signupContext: Omit<SignupOnboardingContext, 'entryVariant'>,
): OnboardingCompletion {
  return {
    completed: true,
    signupContext: {
      ...signupContext,
      entryVariant: signupContext.country === 'KR' ? 'kr' : 'foreign',
    },
    version: ONBOARDING_COMPLETION_VERSION,
  };
}

export function isOnboardingCompletion(value: unknown): value is OnboardingCompletion {
  if (!isRecord(value) || value.version !== ONBOARDING_COMPLETION_VERSION || value.completed !== true) {
    return false;
  }

  const context = value.signupContext;
  if (!isRecord(context)) return false;

  return typeof context.birthYear === 'number'
    && Number.isInteger(context.birthYear)
    && context.birthYear >= 1900
    && context.birthYear <= new Date().getFullYear()
    && SUPPORTED_ONBOARDING_COUNTRIES.includes(context.country as OnboardingCountry)
    && SUPPORTED_ONBOARDING_LANGUAGES.includes(context.language as OnboardingLanguage)
    && context.entryVariant === (context.country === 'KR' ? 'kr' : 'foreign');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
