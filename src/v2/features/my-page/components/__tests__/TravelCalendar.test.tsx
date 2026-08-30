import { getCalendarDaySize } from '../TravelCalendar';

describe('TravelCalendar layout', () => {
  test('6주인 달은 행과 날짜 배지를 압축해 카드 높이가 과도하게 늘어나지 않는다', () => {
    expect(getCalendarDaySize(5)).toBe(44);
    expect(getCalendarDaySize(6)).toBe(38);
    expect((getCalendarDaySize(6) * 6) - (getCalendarDaySize(5) * 5)).toBeLessThanOrEqual(10);
  });
});
