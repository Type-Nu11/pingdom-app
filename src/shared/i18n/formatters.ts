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

export const formatRelativeMinutes = (minutesAgo: number, language: string) =>
  new Intl.RelativeTimeFormat(resolveLocale(language), { numeric: 'auto' })
    .format(-minutesAgo, 'minute');

export const formatMinuteRange = (minimum: number, maximum: number, language: string) => {
  const formatter = new Intl.NumberFormat(resolveLocale(language), {
    maximumFractionDigits: 0,
    style: 'unit',
    unit: 'minute',
    unitDisplay: 'short',
  });
  return `${formatter.format(minimum)}–${formatter.format(maximum)}`;
};
