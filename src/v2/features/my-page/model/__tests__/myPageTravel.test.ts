import {
  isServerTravelDate,
  type ServerTravelDate,
} from '../../../onboarding-preferences/model/onboardingPreference';
import { selectFeaturedTravelSchedule } from '../myPageTravel';

describe('selectFeaturedTravelSchedule', () => {
  test('취소된 일정은 대표 일정에서 제외한다', () => {
    const result = selectFeaturedTravelSchedule([
      {
        endDate: '2026-09-12',
        id: 1,
        startDate: '2026-09-10',
        status: 'CANCELLED',
      },
      {
        endDate: '2026-08-14',
        id: 2,
        startDate: '2026-08-12',
        status: 'ENDED',
      },
    ], serverDate('2026-08-30'));

    expect(result).toEqual({
      endDate: '2026-08-14',
      id: 2,
      startDate: '2026-08-12',
    });
  });
});

function serverDate(value: string): ServerTravelDate {
  if (!isServerTravelDate(value)) throw new Error(`Invalid test date: ${value}`);
  return value;
}
