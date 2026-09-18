import { formatReservationWindow } from '../reservationBooker';

describe('formatReservationWindow', () => {
  test('서버가 다른 날짜의 종료 시각을 보내면 종료 날짜도 표시한다', () => {
    const value = formatReservationWindow({
      reservationStartsAt: new Date(2026, 8, 2, 17, 28).toISOString(),
      reservationEndsAt: new Date(2026, 8, 5, 0, 0).toISOString(),
    }, 'ko');

    expect(value).toContain('2026. 9. 2.');
    expect(value).toContain('2026. 9. 5.');
  });
});
