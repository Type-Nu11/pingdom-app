import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  isOnboardingCompletion,
  type OnboardingCompletion,
} from '../model/onboardingEntry';

export const ONBOARDING_COMPLETION_STORAGE_KEY =
  '@pingdom/onboarding-completed:v1';

export type OnboardingCompletionRestoreResult =
  | Readonly<{ kind: 'empty' | 'invalid' }>
  | Readonly<{ completion: OnboardingCompletion; kind: 'restored' }>;

export async function restoreOnboardingCompletion(): Promise<OnboardingCompletionRestoreResult> {
  const rawValue = await AsyncStorage.getItem(ONBOARDING_COMPLETION_STORAGE_KEY);

  if (rawValue === null) return { kind: 'empty' };

  try {
    const parsedValue: unknown = JSON.parse(rawValue);
    return isOnboardingCompletion(parsedValue)
      ? { completion: parsedValue, kind: 'restored' }
      : { kind: 'invalid' };
  } catch {
    return { kind: 'invalid' };
  }
}

export async function persistOnboardingCompletion(
  completion: OnboardingCompletion,
): Promise<void> {
  await AsyncStorage.setItem(
    ONBOARDING_COMPLETION_STORAGE_KEY,
    JSON.stringify(completion),
  );
}

export async function clearOnboardingCompletionForQa(): Promise<void> {
  await AsyncStorage.removeItem(ONBOARDING_COMPLETION_STORAGE_KEY);
}
