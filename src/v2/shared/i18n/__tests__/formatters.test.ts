import {
  formatCurrency,
  formatDate,
  formatDistance,
  formatLocalDateTime,
  formatMinuteRange,
  formatNumber,
  formatRelativeMinutes,
  resolveLocale,
} from '../formatters';

const digits = (value: string) => value.replace(/[^\d]/g, '');

describe('#389 Japanese formatting', () => {
  test('ja and ja-JP resolve to the ja-JP locale without changing ko/en', () => {
    expect(resolveLocale('ja')).toBe('ja-JP');
    expect(resolveLocale('ja-JP')).toBe('ja-JP');
    expect(resolveLocale('ko')).toBe('ko-KR');
    expect(resolveLocale('en')).toBe('en-US');
  });

  test('currency and amount come from the data, not the UI language', () => {
    const amounts = (['ko', 'en', 'ja'] as const).map((language) => formatCurrency(12000, 'KRW', language));
    expect(new Set(amounts.map(digits))).toEqual(new Set(['12000']));
    expect(formatCurrency(12000, 'KRW', 'ja')).toMatch(/[₩￦]/);
    expect(formatCurrency(12000, 'KRW', 'ja')).not.toContain('¥');
    expect(formatNumber(1234567, 'ja')).toBe('1,234,567');
  });

  test('a place timezone keeps the same calendar date in every language', () => {
    // 2026-09-30 23:30 in Seoul is still 2026-09-30 there, whatever the UI language is.
    const instant = '2026-09-30T14:30:00Z';
    const dates = (['ko', 'en', 'ja'] as const).map((language) => formatDate(instant, language, 'Asia/Seoul'));
    for (const date of dates) {
      expect(date).toContain('26');
      expect(date).toContain('09');
      expect(date).toContain('30');
    }
    expect(formatDate(instant, 'ja', 'Asia/Seoul')).toBe('26/09/30');
  });

  test('date-time, distance, and duration use Japanese conventions', () => {
    expect(formatLocalDateTime(new Date(2026, 8, 30, 14, 5), 'ja')).toBe('2026/09/30 14:05');
    expect(formatDistance(1500, 'ja')).toBe('1.5 km');
    expect(digits(formatDistance(1500, 'ja'))).toBe(digits(formatDistance(1500, 'ko')));
    expect(formatMinuteRange(5, 10, 'ja')).toBe('5 分–10 分');
  });

  test('relative time uses Intl and a Japanese fallback without Intl.RelativeTimeFormat', () => {
    expect(formatRelativeMinutes(7, 'ja')).toBe('7 分前');
    const descriptor = Object.getOwnPropertyDescriptor(Intl, 'RelativeTimeFormat');
    Object.defineProperty(Intl, 'RelativeTimeFormat', { configurable: true, value: undefined });
    try {
      expect(formatRelativeMinutes(0, 'ja')).toBe('今');
      expect(formatRelativeMinutes(18, 'ja-JP')).toBe('18分前');
      expect(formatRelativeMinutes(120, 'ja')).toBe('2時間前');
      expect(formatRelativeMinutes(2880, 'ja')).toBe('2日前');
      expect(formatRelativeMinutes(18, 'ko-KR')).toBe('18분 전');
      expect(formatRelativeMinutes(5, 'en-US')).toBe('5 min ago');
      expect(formatRelativeMinutes(0, 'zh')).toBe('现在');
    } finally {
      if (descriptor) Object.defineProperty(Intl, 'RelativeTimeFormat', descriptor);
    }
  });
});
