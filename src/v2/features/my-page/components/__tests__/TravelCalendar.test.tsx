import { buildCalendarDays } from '../../../onboarding-preferences/model/travelScheduleCalendar';
import {
  isServerTravelDate,
  type ServerTravelDate,
} from '../../../onboarding-preferences/model/onboardingPreference';
import { getCalendarHeight, getRangeCellState } from '../TravelCalendar';

describe('TravelCalendar layout', () => {
  test('기기 폭에서도 Figma 달력의 354:320 비율을 유지한다', () => {
    expect(getCalendarHeight(354)).toBe(320);
    expect(getCalendarHeight(339)).toBeCloseTo(306.44, 2);
  });

  test('12일부터 14일까지인 일정은 같은 주의 9~11일과 15일을 칠하지 않는다', () => {
    const augustWeeks = chunkIntoWeeks(buildCalendarDays({ month: 8, year: 2026 }));
    const targetWeek = augustWeeks.find((week) => week.some((day) => day?.day === 12));
    expect(targetWeek).toBeDefined();

    const states = targetWeek!.map((_, index) => getRangeCellState(targetWeek!, index, {
      endDate: serverDate('2026-08-14'),
      startDate: serverDate('2026-08-12'),
    }));

    expect(states.map((state) => state.inRange)).toEqual([false, false, false, true, true, true, false]);
    expect(states.map((state) => state.segmentStart)).toEqual([false, false, false, true, false, false, false]);
    expect(states.map((state) => state.segmentEnd)).toEqual([false, false, false, false, false, true, false]);
  });
});

function chunkIntoWeeks<T>(items: readonly T[]): T[][] {
  const weeks: T[][] = [];
  for (let index = 0; index < items.length; index += 7) {
    weeks.push(items.slice(index, index + 7));
  }
  return weeks;
}

function serverDate(value: string): ServerTravelDate {
  if (!isServerTravelDate(value)) throw new Error(`Invalid test date: ${value}`);
  return value;
}
