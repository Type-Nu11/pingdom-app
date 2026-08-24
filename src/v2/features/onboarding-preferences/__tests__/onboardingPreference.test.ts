import {
  CURRENT_NEED_OPTIONS,
  TRAVEL_PURPOSE_OPTIONS,
  TRAVEL_PURPOSE_VALUES,
  isCurrentNeed,
  isServerTravelDate,
  isTravelPurposeSelection,
  parseTravelDateRange,
  toCreateTravelScheduleBody,
} from '..';

describe('onboarding preference options', () => {
  it('lists every OpenAPI travel purpose in server order', () => {
    expect(TRAVEL_PURPOSE_OPTIONS.map(({ value }) => value)).toEqual(TRAVEL_PURPOSE_VALUES);
    expect(TRAVEL_PURPOSE_OPTIONS.map(({ order }) => order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

describe('travel purpose selection', () => {
  it('accepts empty and multiple unique server values', () => {
    expect(isTravelPurposeSelection([])).toBe(true);
    expect(isTravelPurposeSelection(['K_POP', 'FOOD', 'CAFE'])).toBe(true);
  });

  it('rejects duplicate and unsupported values', () => {
    expect(isTravelPurposeSelection(['K_POP', 'K_POP'])).toBe(false);
    expect(isTravelPurposeSelection(['K_POP', 'INVALID'])).toBe(false);
    expect(isTravelPurposeSelection('K_POP')).toBe(false);
  });
});

describe('current need', () => {
  it('accepts every option and rejects unsupported input', () => {
    for (const option of CURRENT_NEED_OPTIONS) {
      expect(isCurrentNeed(option.value)).toBe(true);
    }

    expect(isCurrentNeed('FOOD')).toBe(false);
    expect(isCurrentNeed(null)).toBe(false);
  });
});

describe('travel date range', () => {
  it('accepts OpenAPI full-date values and same-day ranges', () => {
    expect(isServerTravelDate('2028-02-29')).toBe(true);

    const range = parseTravelDateRange({
      endDateText: '2026-08-24',
      startDateText: '2026-08-24',
    });

    expect(range).not.toBeNull();
    expect(range && toCreateTravelScheduleBody(range)).toEqual({
      endDate: '2026-08-24',
      startDate: '2026-08-24',
    });
  });

  it('rejects invalid dates, display strings, and reversed periods', () => {
    expect(isServerTravelDate('2026-02-29')).toBe(false);
    expect(isServerTravelDate('2026.08.24')).toBe(false);
    expect(isServerTravelDate('2026-08-24T00:00:00Z')).toBe(false);
    expect(parseTravelDateRange({
      endDateText: '2026-08-23',
      startDateText: '2026-08-24',
    })).toBeNull();
  });
});
