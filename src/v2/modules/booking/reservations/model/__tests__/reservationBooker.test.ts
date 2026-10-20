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

  test('일본어는 같은 시각을 ja-JP 형식으로만 바꾸고 날짜 계산은 유지한다', () => {
    const reservation = {
      reservationStartsAt: new Date(2026, 8, 2, 17, 28).toISOString(),
      reservationEndsAt: new Date(2026, 8, 5, 0, 0).toISOString(),
    };

    const japanese = formatReservationWindow(reservation, 'ja');
    expect(japanese).toContain('2026/09/02 17:28');
    expect(japanese).toContain('2026/09/05');
    expect(formatReservationWindow(reservation, 'ko')).toContain('2026. 9. 2.');
    expect(formatReservationWindow(reservation, 'en')).toContain('Sep 2, 2026');
  });
});
