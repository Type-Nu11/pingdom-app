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

describe('#413 Chinese formatting', () => {
  test('the formatter locale follows the same Simplified/Traditional split as the language picker', () => {
    for (const language of ['zh', 'zh-CN', 'zh_CN', 'zh-Hans', 'zh-Hans-TW', 'zh-SG']) {
      expect(resolveLocale(language)).toBe('zh-CN');
    }
    for (const language of ['zh-TW', 'zh_TW', 'zh-Hant', 'zh-HK', 'zh-MO', 'zh-Hant-CN']) {
      expect(resolveLocale(language)).toBe('zh-TW');
    }
    expect(resolveLocale('ja')).toBe('ja-JP');
    expect(resolveLocale('ko')).toBe('ko-KR');
    expect(resolveLocale('en')).toBe('en-US');
  });

  test('currency, amount, and numbers come from the data, not the UI language', () => {
    for (const language of ['zh-CN', 'zh-TW'] as const) {
      expect(digits(formatCurrency(12000, 'KRW', language))).toBe('12000');
      expect(formatCurrency(12000, 'KRW', language)).toMatch(/[₩￦]/);
      expect(formatCurrency(12000, 'KRW', language)).not.toMatch(/[¥元]|CN¥|NT\$/);
      expect(formatNumber(1234567, language)).toBe('1,234,567');
    }
  });

  test('a place timezone keeps the same calendar date and time in Chinese', () => {
    const instant = '2026-09-30T14:30:00Z';
    for (const language of ['zh-CN', 'zh-TW'] as const) {
      expect(formatDate(instant, language, 'Asia/Seoul')).toBe(formatDate(instant, 'ja', 'Asia/Seoul'));
      expect(digits(formatLocalDateTime(new Date(2026, 8, 30, 14, 5), language))).toMatch(/^2026930(14|2)05$/);
    }
  });

  test('distance stays metric with the same value, and durations use each script', () => {
    expect(digits(formatDistance(1500, 'zh-CN'))).toBe(digits(formatDistance(1500, 'ko')));
    expect(digits(formatDistance(1500, 'zh-TW'))).toBe(digits(formatDistance(1500, 'ko')));
    expect(formatDistance(1500, 'zh-CN')).toMatch(/公里|km/);
    expect(formatMinuteRange(5, 10, 'zh-CN')).toContain('分钟');
    expect(formatMinuteRange(5, 10, 'zh-TW')).toContain('分鐘');
  });

  test('relative time has a per-script fallback without Intl.RelativeTimeFormat', () => {
    expect(formatRelativeMinutes(7, 'zh-CN')).toContain('分钟前');
    expect(formatRelativeMinutes(7, 'zh-TW')).toContain('分鐘前');
    const descriptor = Object.getOwnPropertyDescriptor(Intl, 'RelativeTimeFormat');
    Object.defineProperty(Intl, 'RelativeTimeFormat', { configurable: true, value: undefined });
    try {
      expect(formatRelativeMinutes(0, 'zh-CN')).toBe('现在');
      expect(formatRelativeMinutes(18, 'zh-CN')).toBe('18分钟前');
      expect(formatRelativeMinutes(120, 'zh')).toBe('2小时前');
      expect(formatRelativeMinutes(0, 'zh-TW')).toBe('現在');
      expect(formatRelativeMinutes(18, 'zh-Hant-HK')).toBe('18分鐘前');
      expect(formatRelativeMinutes(120, 'zh-TW')).toBe('2小時前');
      expect(formatRelativeMinutes(2880, 'zh-TW')).toBe('2天前');
      expect(formatRelativeMinutes(18, 'ko-KR')).toBe('18분 전');
      expect(formatRelativeMinutes(18, 'ja')).toBe('18分前');
    } finally {
      if (descriptor) Object.defineProperty(Intl, 'RelativeTimeFormat', descriptor);
    }
  });
});

describe('#414 Vietnamese formatting', () => {
  test('vi and vi-VN keep the existing vi-VN locale branch', () => {
    expect(resolveLocale('vi')).toBe('vi-VN');
    expect(resolveLocale('vi-VN')).toBe('vi-VN');
    expect(resolveLocale('vi_VN')).toBe('vi-VN');
  });

  test('currency, amount, and numbers come from the data, not the UI language', () => {
    expect(digits(formatCurrency(12000, 'KRW', 'vi'))).toBe('12000');
    expect(formatCurrency(12000, 'KRW', 'vi')).toMatch(/[₩￦]/);
    expect(formatCurrency(12000, 'KRW', 'vi')).not.toMatch(/₫|VND/);
    expect(formatNumber(1234567, 'vi')).toBe('1.234.567');
  });

  test('a place timezone keeps the same calendar date, shown day-first', () => {
    const instant = '2026-09-30T14:30:00Z';
    expect(formatDate(instant, 'vi', 'Asia/Seoul')).toBe('30/09/26');
    // The same instant read in a timezone a day behind must not leak into the Seoul date.
    expect(formatDate(instant, 'vi', 'Asia/Seoul')).not.toBe(formatDate('2026-09-29T14:30:00Z', 'vi', 'Asia/Seoul'));
    expect(digits(formatLocalDateTime(new Date(2026, 8, 30, 14, 5), 'vi'))).toBe('14053092026');
  });

  test('distance stays metric with a decimal comma, and durations are Vietnamese', () => {
    expect(formatDistance(1500, 'vi')).toBe('1,5 km');
    expect(digits(formatDistance(1500, 'vi'))).toBe(digits(formatDistance(1500, 'ko')));
    expect(formatMinuteRange(5, 10, 'vi')).toBe('5 phút–10 phút');
  });

  test('relative time uses Intl and a Vietnamese fallback without Intl.RelativeTimeFormat', () => {
    expect(formatRelativeMinutes(7, 'vi')).toBe('7 phút trước');
    const descriptor = Object.getOwnPropertyDescriptor(Intl, 'RelativeTimeFormat');
    Object.defineProperty(Intl, 'RelativeTimeFormat', { configurable: true, value: undefined });
    try {
      expect(formatRelativeMinutes(0, 'vi')).toBe('bây giờ');
      expect(formatRelativeMinutes(18, 'vi-VN')).toBe('18 phút trước');
      expect(formatRelativeMinutes(120, 'vi')).toBe('2 giờ trước');
      expect(formatRelativeMinutes(2880, 'vi')).toBe('2 ngày trước');
      expect(formatRelativeMinutes(5, 'en-US')).toBe('5 min ago');
    } finally {
      if (descriptor) Object.defineProperty(Intl, 'RelativeTimeFormat', descriptor);
    }
  });
});
