import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  ONBOARDING_PREFERENCE_STORAGE_KEY,
  useOnboardingPreferenceStore,
} from '../..';

function resetStoreMemory() {
  useOnboardingPreferenceStore.setState(
    useOnboardingPreferenceStore.getInitialState(),
    true,
  );
}

describe('onboarding preference store', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    resetStoreMemory();
  });

  test('exposes loading and restores safe defaults when no saved values exist', async () => {
    let finishRead: ((value: string | null) => void) | undefined;
    jest.spyOn(AsyncStorage, 'getItem').mockImplementationOnce(
      () => new Promise((resolve) => {
        finishRead = resolve;
      }),
    );

    const hydration = useOnboardingPreferenceStore.getState().hydratePreferences();

    expect(useOnboardingPreferenceStore.getState()).toMatchObject({
      hydrationError: null,
      hydrationStatus: 'loading',
      isHydrated: false,
    });

    finishRead?.(null);
    await hydration;

    expect(useOnboardingPreferenceStore.getState()).toMatchObject({
      hydrationError: null,
      hydrationStatus: 'ready',
      isHydrated: true,
      saveError: null,
      saveStatus: 'idle',
      selectedPurposes: [],
      selectedSchedule: {
        endDateText: '',
        startDateText: '',
      },
    });
  });

  test('persists purpose and schedule values and restores them after memory resets', async () => {
    const store = useOnboardingPreferenceStore.getState();

    await store.setSelectedPurposes(['K_POP', 'CAFE']);
    await store.setSelectedSchedule({
      endDateText: '2026-09-12',
      startDateText: '2026-09-05',
    });

    expect(JSON.parse(
      await AsyncStorage.getItem(ONBOARDING_PREFERENCE_STORAGE_KEY) ?? '{}',
    )).toEqual({
      selectedPurposes: ['K_POP', 'CAFE'],
      selectedSchedule: {
        endDateText: '2026-09-12',
        startDateText: '2026-09-05',
      },
      version: 1,
    });

    resetStoreMemory();
    await useOnboardingPreferenceStore.getState().hydratePreferences();

    expect(useOnboardingPreferenceStore.getState()).toMatchObject({
      hydrationError: null,
      hydrationStatus: 'ready',
      isHydrated: true,
      selectedPurposes: ['K_POP', 'CAFE'],
      selectedSchedule: {
        endDateText: '2026-09-12',
        startDateText: '2026-09-05',
      },
    });
  });

  test('does not overwrite a newer selection when hydration finishes late', async () => {
    let finishRead: ((value: string | null) => void) | undefined;
    jest.spyOn(AsyncStorage, 'getItem').mockImplementationOnce(
      () => new Promise((resolve) => {
        finishRead = resolve;
      }),
    );

    const hydration = useOnboardingPreferenceStore.getState().hydratePreferences();
    await useOnboardingPreferenceStore.getState().setSelectedPurposes(['FASHION']);

    finishRead?.(JSON.stringify({
      selectedPurposes: ['K_POP'],
      selectedSchedule: { endDateText: '', startDateText: '' },
      version: 1,
    }));
    await hydration;

    expect(useOnboardingPreferenceStore.getState()).toMatchObject({
      hydrationStatus: 'ready',
      isHydrated: true,
      selectedPurposes: ['FASHION'],
    });
  });

  test.each([
    ['malformed JSON', '{'],
    [
      'unsupported purpose',
      JSON.stringify({
        selectedPurposes: ['NOT_A_PURPOSE'],
        selectedSchedule: { endDateText: '', startDateText: '' },
        version: 1,
      }),
    ],
    [
      'invalid schedule',
      JSON.stringify({
        selectedPurposes: ['FOOD'],
        selectedSchedule: {
          endDateText: '2026-09-04',
          startDateText: '2026-09-05',
        },
        version: 1,
      }),
    ],
  ])('uses defaults and exposes invalid-data for %s', async (_, storedValue) => {
    await AsyncStorage.setItem(ONBOARDING_PREFERENCE_STORAGE_KEY, storedValue);

    await useOnboardingPreferenceStore.getState().hydratePreferences();

    expect(useOnboardingPreferenceStore.getState()).toMatchObject({
      hydrationError: 'invalid-data',
      hydrationStatus: 'error',
      isHydrated: true,
      selectedPurposes: [],
      selectedSchedule: { endDateText: '', startDateText: '' },
    });
  });

  test('uses defaults and exposes a read failure without rejecting hydration', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('read failed'));

    await expect(
      useOnboardingPreferenceStore.getState().hydratePreferences(),
    ).resolves.toBeUndefined();

    expect(useOnboardingPreferenceStore.getState()).toMatchObject({
      hydrationError: 'storage-read-failed',
      hydrationStatus: 'error',
      isHydrated: true,
      selectedPurposes: [],
      selectedSchedule: { endDateText: '', startDateText: '' },
    });
  });

  test('keeps the selected value and exposes a write failure for UI recovery', async () => {
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('write failed'));

    await expect(
      useOnboardingPreferenceStore.getState().setSelectedPurposes(['BEAUTY']),
    ).resolves.toBeUndefined();

    expect(useOnboardingPreferenceStore.getState()).toMatchObject({
      saveError: 'storage-write-failed',
      saveStatus: 'error',
      selectedPurposes: ['BEAUTY'],
    });

    await useOnboardingPreferenceStore.getState().persistPreferences();

    expect(useOnboardingPreferenceStore.getState()).toMatchObject({
      saveError: null,
      saveStatus: 'idle',
    });
  });

  test('exposes saving until the pending storage write finishes', async () => {
    let finishWrite: (() => void) | undefined;
    jest.spyOn(AsyncStorage, 'setItem').mockImplementationOnce(
      () => new Promise((resolve) => {
        finishWrite = resolve;
      }),
    );

    const saving = useOnboardingPreferenceStore
      .getState()
      .setSelectedPurposes(['EXHIBITION']);

    expect(useOnboardingPreferenceStore.getState()).toMatchObject({
      saveError: null,
      saveStatus: 'saving',
      selectedPurposes: ['EXHIBITION'],
    });

    await Promise.resolve();
    expect(finishWrite).toEqual(expect.any(Function));
    finishWrite?.();
    await saving;

    expect(useOnboardingPreferenceStore.getState()).toMatchObject({
      saveError: null,
      saveStatus: 'idle',
    });
  });

  test('clears the temporary draft from memory and storage', async () => {
    const store = useOnboardingPreferenceStore.getState();
    await store.setSelectedPurposes(['FOOD']);
    await store.setSelectedSchedule({
      endDateText: '',
      startDateText: '2026-09-05',
    });

    await useOnboardingPreferenceStore.getState().clearPreferences();

    expect(useOnboardingPreferenceStore.getState()).toMatchObject({
      saveError: null,
      saveStatus: 'idle',
      selectedPurposes: [],
      selectedSchedule: { endDateText: '', startDateText: '' },
    });
    expect(await AsyncStorage.getItem(ONBOARDING_PREFERENCE_STORAGE_KEY)).toBeNull();
  });
});
