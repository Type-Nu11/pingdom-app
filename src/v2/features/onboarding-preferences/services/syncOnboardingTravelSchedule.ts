import { travelScheduleApi } from '../../travel-schedules';
import {
  parseTravelDateRange,
  toCreateTravelScheduleBody,
} from '../model/onboardingPreference';
import {
  clearStoredOnboardingPreferences,
  restoreOnboardingPreferences,
} from './onboardingPreferenceStorage';

type CreateTravelScheduleFn = Pick<
  typeof travelScheduleApi,
  'createTravelSchedule'
>;

export type SyncOnboardingTravelScheduleResult =
  | Readonly<{ status: 'created' }>
  | Readonly<{
    reason: 'incomplete-range' | 'no-stored-schedule';
    status: 'skipped';
  }>;

/**
 * 온보딩에서 사용자가 입력한 여행 일정은 인증 전이라 로컬(AsyncStorage)에만 저장된다.
 * 로그인 이후 이 함수가 저장된 일정을 서버로 옮기고 로컬 값을 비운다. 이후 마이페이지는
 * 서버(`GET /users/me/travel-schedules`)만 바라보면 된다.
 */
export async function syncOnboardingTravelScheduleToServer(
  api: CreateTravelScheduleFn = travelScheduleApi,
): Promise<SyncOnboardingTravelScheduleResult> {
  const restored = await restoreOnboardingPreferences();

  if (restored.kind !== 'restored') {
    return { reason: 'no-stored-schedule', status: 'skipped' };
  }

  const range = parseTravelDateRange(restored.values.selectedSchedule);

  if (!range) {
    return { reason: 'incomplete-range', status: 'skipped' };
  }

  await api.createTravelSchedule(toCreateTravelScheduleBody(range));
  await clearStoredOnboardingPreferences();

  return { status: 'created' };
}
