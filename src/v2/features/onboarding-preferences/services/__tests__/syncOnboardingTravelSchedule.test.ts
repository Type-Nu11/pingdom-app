import AsyncStorage from '@react-native-async-storage/async-storage';

import type { TravelDateInput } from '../../model/onboardingPreference';
import {
  ONBOARDING_PREFERENCE_STORAGE_KEY,
  persistOnboardingPreferences,
} from '../..';
import { syncOnboardingTravelScheduleToServer } from '../syncOnboardingTravelSchedule';

const RANGE: TravelDateInput = {
  endDateText: '2026-09-12',
  startDateText: '2026-09-05',
};

async function seedStoredSchedule(schedule: TravelDateInput = RANGE): Promise<void> {
  await persistOnboardingPreferences({
    selectedPurposes: [],
    selectedSchedule: schedule,
  });
}

describe('syncOnboardingTravelScheduleToServer', () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
    await AsyncStorage.clear();
  });

  test('creates a server schedule from the stored onboarding range and clears local storage', async () => {
    await seedStoredSchedule();
    const createTravelSchedule = jest.fn().mockResolvedValue({});

    const result = await syncOnboardingTravelScheduleToServer({ createTravelSchedule });

    expect(createTravelSchedule).toHaveBeenCalledWith({
      endDate: '2026-09-12',
      startDate: '2026-09-05',
    });
    expect(result).toEqual({ status: 'created' });
    expect(await AsyncStorage.getItem(ONBOARDING_PREFERENCE_STORAGE_KEY)).toBeNull();
  });

  test('skips when nothing is stored', async () => {
    const createTravelSchedule = jest.fn();

    const result = await syncOnboardingTravelScheduleToServer({ createTravelSchedule });

    expect(createTravelSchedule).not.toHaveBeenCalled();
    expect(result).toEqual({ reason: 'no-stored-schedule', status: 'skipped' });
  });

  test('skips an incomplete stored range without calling the server', async () => {
    await seedStoredSchedule({ endDateText: '', startDateText: '2026-09-05' });
    const createTravelSchedule = jest.fn();

    const result = await syncOnboardingTravelScheduleToServer({ createTravelSchedule });

    expect(createTravelSchedule).not.toHaveBeenCalled();
    expect(result).toEqual({ reason: 'incomplete-range', status: 'skipped' });
  });

  test('keeps local storage intact when the server call fails', async () => {
    await seedStoredSchedule();
    const stored = await AsyncStorage.getItem(ONBOARDING_PREFERENCE_STORAGE_KEY);
    const createTravelSchedule = jest.fn().mockRejectedValue(new Error('network down'));

    await expect(
      syncOnboardingTravelScheduleToServer({ createTravelSchedule }),
    ).rejects.toThrow('network down');
    expect(await AsyncStorage.getItem(ONBOARDING_PREFERENCE_STORAGE_KEY)).toBe(stored);
  });
});
