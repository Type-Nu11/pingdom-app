import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  isTravelPurposeSelection,
  type TravelDateInput,
  type TravelPurposeSelection,
} from '../model/onboardingPreference';
import { getTravelScheduleSelectionState } from '../model/travelScheduleCalendar';

export const ONBOARDING_PREFERENCE_STORAGE_KEY =
  '@pingdom/v2/onboarding-preferences:v1';

const STORAGE_VERSION = 1;

export type OnboardingPreferenceValues = Readonly<{
  selectedPurposes: TravelPurposeSelection;
  selectedSchedule: TravelDateInput;
}>;

export type OnboardingPreferenceRestoreResult = Readonly<{
  kind: 'empty' | 'invalid' | 'restored';
  values: OnboardingPreferenceValues;
}>;

type StoredOnboardingPreference = Readonly<{
  selectedPurposes: TravelPurposeSelection;
  selectedSchedule: TravelDateInput;
  version: typeof STORAGE_VERSION;
}>;

export function createDefaultOnboardingPreferenceValues(): OnboardingPreferenceValues {
  return {
    selectedPurposes: [],
    selectedSchedule: {
      endDateText: '',
      startDateText: '',
    },
  };
}

export async function restoreOnboardingPreferences(): Promise<OnboardingPreferenceRestoreResult> {
  const rawValue = await AsyncStorage.getItem(ONBOARDING_PREFERENCE_STORAGE_KEY);

  if (rawValue === null) {
    return {
      kind: 'empty',
      values: createDefaultOnboardingPreferenceValues(),
    };
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue);

    if (!isStoredOnboardingPreference(parsedValue)) {
      return {
        kind: 'invalid',
        values: createDefaultOnboardingPreferenceValues(),
      };
    }

    return {
      kind: 'restored',
      values: {
        selectedPurposes: [...parsedValue.selectedPurposes],
        selectedSchedule: { ...parsedValue.selectedSchedule },
      },
    };
  } catch {
    return {
      kind: 'invalid',
      values: createDefaultOnboardingPreferenceValues(),
    };
  }
}

export async function persistOnboardingPreferences(
  values: OnboardingPreferenceValues,
): Promise<void> {
  const storedValue: StoredOnboardingPreference = {
    selectedPurposes: values.selectedPurposes,
    selectedSchedule: values.selectedSchedule,
    version: STORAGE_VERSION,
  };

  await AsyncStorage.setItem(
    ONBOARDING_PREFERENCE_STORAGE_KEY,
    JSON.stringify(storedValue),
  );
}

export async function clearStoredOnboardingPreferences(): Promise<void> {
  await AsyncStorage.removeItem(ONBOARDING_PREFERENCE_STORAGE_KEY);
}

function isStoredOnboardingPreference(
  value: unknown,
): value is StoredOnboardingPreference {
  if (!isRecord(value) || value.version !== STORAGE_VERSION) {
    return false;
  }

  return isTravelPurposeSelection(value.selectedPurposes)
    && isTravelDateInput(value.selectedSchedule);
}

function isTravelDateInput(value: unknown): value is TravelDateInput {
  if (
    !isRecord(value)
    || typeof value.endDateText !== 'string'
    || typeof value.startDateText !== 'string'
  ) {
    return false;
  }

  return getTravelScheduleSelectionState({
    endDateText: value.endDateText,
    startDateText: value.startDateText,
  }).kind !== 'invalid';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
