import {
  buildCalendarDays,
  getInitialCalendarMonth,
  getTravelScheduleSelectionState,
  selectTravelDate,
  shiftCalendarMonth,
} from '../model/travelScheduleCalendar';
import {
  isServerTravelDate,
  type ServerTravelDate,
} from '..';

function serverDate(value: string): ServerTravelDate {
  if (!isServerTravelDate(value)) {
    throw new Error(`Invalid test date: ${value}`);
  }

  return value;
}

describe('travel schedule selection state', () => {
  test('empty, start-only, complete, and invalid inputs stay distinct', () => {
    expect(getTravelScheduleSelectionState({
      endDateText: '',
      startDateText: '',
    })).toEqual({ kind: 'empty' });
    expect(getTravelScheduleSelectionState({
      endDateText: '',
      startDateText: '2026-07-05',
    })).toEqual({ kind: 'start-only', startDate: '2026-07-05' });
    expect(getTravelScheduleSelectionState({
      endDateText: '2026-07-18',
      startDateText: '2026-07-05',
    })).toEqual({
      kind: 'complete',
      range: { endDate: '2026-07-18', startDate: '2026-07-05' },
    });
    expect(getTravelScheduleSelectionState({
      endDateText: '2026-07-04',
      startDateText: '2026-07-05',
    })).toEqual({ kind: 'invalid' });
  });

  test('only accepts an end date on or after the selected start date', () => {
    const startOnly = { endDateText: '', startDateText: '2026-07-05' };

    expect(selectTravelDate(startOnly, serverDate('2026-07-04'))).toBe(startOnly);
    expect(selectTravelDate(startOnly, serverDate('2026-07-05'))).toEqual({
      endDateText: '2026-07-05',
      startDateText: '2026-07-05',
    });
    expect(selectTravelDate(startOnly, serverDate('2026-07-18'))).toEqual({
      endDateText: '2026-07-18',
      startDateText: '2026-07-05',
    });
  });

  test('starts a fresh range from empty, complete, or invalid input', () => {
    const selectedDate = serverDate('2026-07-12');

    for (const schedule of [
      { endDateText: '', startDateText: '' },
      { endDateText: '2026-07-18', startDateText: '2026-07-05' },
      { endDateText: '2026-07-04', startDateText: 'not-a-date' },
    ]) {
      expect(selectTravelDate(schedule, selectedDate)).toEqual({
        endDateText: '',
        startDateText: '2026-07-12',
      });
    }
  });
});

describe('travel schedule calendar', () => {
  test('builds complete calendar weeks with server-date values', () => {
    const days = buildCalendarDays({ month: 7, year: 2026 });

    expect(days).toHaveLength(35);
    expect(days.filter(Boolean)).toHaveLength(31);
    expect(days[3]).toEqual({ date: '2026-07-01', day: 1, weekday: 3 });
    expect(days[33]).toEqual({ date: '2026-07-31', day: 31, weekday: 5 });
  });

  test('moves across year boundaries and chooses a safe initial month', () => {
    expect(shiftCalendarMonth({ month: 12, year: 2026 }, 1)).toEqual({
      month: 1,
      year: 2027,
    });
    expect(getInitialCalendarMonth(
      { endDateText: '', startDateText: '' },
      new Date(2026, 7, 24),
    )).toEqual({ month: 8, year: 2026 });
    expect(getInitialCalendarMonth({
      endDateText: '2026-07-18',
      startDateText: '2026-07-05',
    })).toEqual({ month: 7, year: 2026 });
  });
});
