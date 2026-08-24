import { create } from 'zustand';

import type {
  TravelDateInput,
  TravelPurposeSelection,
} from '../model/onboardingPreference';
import {
  clearStoredOnboardingPreferences,
  createDefaultOnboardingPreferenceValues,
  persistOnboardingPreferences,
  restoreOnboardingPreferences,
  type OnboardingPreferenceValues,
} from '../services/onboardingPreferenceStorage';

export type OnboardingPreferenceHydrationStatus =
  | 'error'
  | 'idle'
  | 'loading'
  | 'ready';

export type OnboardingPreferenceHydrationError =
  | 'invalid-data'
  | 'storage-read-failed';

export type OnboardingPreferenceSaveStatus = 'error' | 'idle' | 'saving';
export type OnboardingPreferenceSaveError = 'storage-write-failed';

export type OnboardingPreferenceState = OnboardingPreferenceValues & Readonly<{
  hydrationError: OnboardingPreferenceHydrationError | null;
  hydrationStatus: OnboardingPreferenceHydrationStatus;
  isHydrated: boolean;
  saveError: OnboardingPreferenceSaveError | null;
  saveStatus: OnboardingPreferenceSaveStatus;
}>;

type OnboardingPreferenceActions = {
  clearPreferences: () => Promise<void>;
  hydratePreferences: () => Promise<void>;
  persistPreferences: () => Promise<void>;
  setSelectedPurposes: (selectedPurposes: TravelPurposeSelection) => Promise<void>;
  setSelectedSchedule: (selectedSchedule: TravelDateInput) => Promise<void>;
};

export type OnboardingPreferenceStore = OnboardingPreferenceState
  & OnboardingPreferenceActions;

let hydrationPromise: Promise<void> | null = null;
let localChangeRevision = 0;
let latestSaveRequest = 0;
let saveQueue: Promise<void> = Promise.resolve();

const initialValues = createDefaultOnboardingPreferenceValues();

const initialState: OnboardingPreferenceState = {
  ...initialValues,
  hydrationError: null,
  hydrationStatus: 'idle',
  isHydrated: false,
  saveError: null,
  saveStatus: 'idle',
};

export const useOnboardingPreferenceStore = create<OnboardingPreferenceStore>(
  (set, get) => {
    const save = async (operation: () => Promise<void>) => {
      const requestId = ++latestSaveRequest;
      set({ saveError: null, saveStatus: 'saving' });

      const queuedOperation = saveQueue.then(operation, operation);
      saveQueue = queuedOperation.catch(() => undefined);

      try {
        await queuedOperation;

        if (requestId === latestSaveRequest) {
          set({ saveError: null, saveStatus: 'idle' });
        }
      } catch {
        if (requestId === latestSaveRequest) {
          set({
            saveError: 'storage-write-failed',
            saveStatus: 'error',
          });
        }
      }
    };

    const readCurrentValues = (): OnboardingPreferenceValues => {
      const { selectedPurposes, selectedSchedule } = get();
      return { selectedPurposes, selectedSchedule };
    };

    return {
      ...initialState,

      clearPreferences: async () => {
        localChangeRevision += 1;
        set(createDefaultOnboardingPreferenceValues());
        await save(clearStoredOnboardingPreferences);
      },

      hydratePreferences: () => {
        if (hydrationPromise) {
          return hydrationPromise;
        }

        const revisionAtStart = localChangeRevision;
        set({
          hydrationError: null,
          hydrationStatus: 'loading',
          isHydrated: false,
        });

        hydrationPromise = (async () => {
          try {
            const result = await restoreOnboardingPreferences();
            const restoredValues = revisionAtStart === localChangeRevision
              ? result.values
              : {};

            set({
              ...restoredValues,
              hydrationError: result.kind === 'invalid' ? 'invalid-data' : null,
              hydrationStatus: result.kind === 'invalid' ? 'error' : 'ready',
              isHydrated: true,
            });
          } catch {
            const defaultValues = revisionAtStart === localChangeRevision
              ? createDefaultOnboardingPreferenceValues()
              : {};

            set({
              ...defaultValues,
              hydrationError: 'storage-read-failed',
              hydrationStatus: 'error',
              isHydrated: true,
            });
          } finally {
            hydrationPromise = null;
          }
        })();

        return hydrationPromise;
      },

      persistPreferences: async () => {
        const values = readCurrentValues();
        await save(() => persistOnboardingPreferences(values));
      },

      setSelectedPurposes: async (selectedPurposes) => {
        localChangeRevision += 1;
        set({ selectedPurposes: [...selectedPurposes] });
        const values = readCurrentValues();
        await save(() => persistOnboardingPreferences(values));
      },

      setSelectedSchedule: async (selectedSchedule) => {
        localChangeRevision += 1;
        set({ selectedSchedule: { ...selectedSchedule } });
        const values = readCurrentValues();
        await save(() => persistOnboardingPreferences(values));
      },
    };
  },
);
