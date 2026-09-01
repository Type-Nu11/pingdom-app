const METRIC_LOCALES = new Set(['ko', 'ja', 'zh', 'vi', 'th']);

export const resolveLocale = (language: string) => {
  const normalized = language.toLowerCase();
  if (normalized.startsWith('ko')) return 'ko-KR';
  if (normalized.startsWith('ja')) return 'ja-JP';
  if (normalized.startsWith('zh')) return 'zh-CN';
  if (normalized.startsWith('vi')) return 'vi-VN';
  if (normalized.startsWith('th')) return 'th-TH';
  return 'en-US';
};

export const formatLocalDateTime = (value: Date | number | string, language: string) =>
  new Intl.DateTimeFormat(resolveLocale(language), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export const formatCurrency = (value: number, currency: string, language: string) =>
  new Intl.NumberFormat(resolveLocale(language), {
    currency,
    style: 'currency',
  }).format(value);

export const formatDate = (value: Date | number | string, language: string, timeZone?: string) =>
  new Intl.DateTimeFormat(resolveLocale(language), {
    day: '2-digit', month: '2-digit', timeZone, year: '2-digit',
  }).format(new Date(value));

export const formatNumber = (value: number, language: string) =>
  new Intl.NumberFormat(resolveLocale(language)).format(value);

export const formatPercent = (value: number, language: string) =>
  new Intl.NumberFormat(resolveLocale(language), { style: 'percent' }).format(value);

export const formatDistance = (meters: number, language: string) => {
  const baseLanguage = language.toLowerCase().split('-')[0];
  const metric = METRIC_LOCALES.has(baseLanguage);
  const value = metric ? meters / 1000 : meters / 1609.344;
  const unit = metric ? 'kilometer' : 'mile';
  return new Intl.NumberFormat(resolveLocale(language), {
    maximumFractionDigits: value < 10 ? 1 : 0,
    style: 'unit',
    unit,
    unitDisplay: 'short',
  }).format(value);
};

const resolveRelativeValue = (minutesAgo: number) => {
  const minutes = Math.max(0, Math.round(minutesAgo));
  if (minutes >= 1440) return { unit: 'day' as const, value: Math.round(minutes / 1440) };
  if (minutes >= 60) return { unit: 'hour' as const, value: Math.round(minutes / 60) };
  return { unit: 'minute' as const, value: minutes };
};

const formatRelativeMinutesFallback = (minutesAgo: number, language: string) => {
  const { unit, value } = resolveRelativeValue(minutesAgo);
  const baseLanguage = language.toLowerCase().split('-')[0];

  if (value === 0) {
    if (baseLanguage === 'ko') return '지금';
    if (baseLanguage === 'ja') return '今';
    if (baseLanguage === 'zh') return '现在';
    if (baseLanguage === 'vi') return 'bây giờ';
    if (baseLanguage === 'th') return 'ตอนนี้';
    return 'now';
  }

  const fallbackUnits = {
    day: { en: 'day', ko: '일' },
    hour: { en: 'hr', ko: '시간' },
    minute: { en: 'min', ko: '분' },
  } as const;
  if (baseLanguage === 'ko') return `${value}${fallbackUnits[unit].ko} 전`;
  return `${value} ${fallbackUnits[unit].en} ago`;
};

export const formatRelativeMinutes = (minutesAgo: number, language: string) => {
  const RelativeTimeFormat = Intl.RelativeTimeFormat;

  if (typeof RelativeTimeFormat !== 'function') {
    return formatRelativeMinutesFallback(minutesAgo, language);
  }

  try {
    const { unit, value } = resolveRelativeValue(minutesAgo);
    return new RelativeTimeFormat(resolveLocale(language), { numeric: 'auto' })
      .format(-value, unit);
  } catch {
    return formatRelativeMinutesFallback(minutesAgo, language);
  }
};

export const formatMinuteRange = (minimum: number, maximum: number, language: string) => {
  const formatter = new Intl.NumberFormat(resolveLocale(language), {
    maximumFractionDigits: 0,
    style: 'unit',
    unit: 'minute',
    unitDisplay: 'short',
  });
  return `${formatter.format(minimum)}–${formatter.format(maximum)}`;
};
