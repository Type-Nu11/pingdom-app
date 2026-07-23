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

const formatRelativeMinutesFallback = (minutesAgo: number, language: string) => {
  const minutes = Math.max(0, Math.round(minutesAgo));
  const baseLanguage = language.toLowerCase().split('-')[0];

  if (minutes === 0) {
    if (baseLanguage === 'ko') return '지금';
    if (baseLanguage === 'ja') return '今';
    if (baseLanguage === 'zh') return '现在';
    if (baseLanguage === 'vi') return 'bây giờ';
    if (baseLanguage === 'th') return 'ตอนนี้';
    return 'now';
  }

  if (baseLanguage === 'ko') return `${minutes}분 전`;
  if (baseLanguage === 'ja') return `${minutes}分前`;
  if (baseLanguage === 'zh') return `${minutes}分钟前`;
  if (baseLanguage === 'vi') return `${minutes} phút trước`;
  if (baseLanguage === 'th') return `${minutes} นาทีที่แล้ว`;
  return `${minutes} min ago`;
};

export const formatRelativeMinutes = (minutesAgo: number, language: string) => {
  const RelativeTimeFormat = Intl.RelativeTimeFormat;

  if (typeof RelativeTimeFormat !== 'function') {
    return formatRelativeMinutesFallback(minutesAgo, language);
  }

  try {
    return new RelativeTimeFormat(resolveLocale(language), { numeric: 'auto' })
      .format(-minutesAgo, 'minute');
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
