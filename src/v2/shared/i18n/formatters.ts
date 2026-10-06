import { isTraditionalChinese, parseLocale } from './locale';

const METRIC_LOCALES = new Set(['ko', 'ja', 'zh', 'vi', 'th']);

export const resolveLocale = (language: string) => {
  const normalized = language.toLowerCase();
  if (normalized.startsWith('ko')) return 'ko-KR';
  if (normalized.startsWith('ja')) return 'ja-JP';
  // Same Simplified/Traditional split as the language picker, so `zh`, `zh-Hans`, `zh-SG` stay zh-CN.
  if (normalized.startsWith('zh')) return isTraditionalChinese(parseLocale(language)) ? 'zh-TW' : 'zh-CN';
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

type RelativeUnit = ReturnType<typeof resolveRelativeValue>['unit'];

// Used only when Intl.RelativeTimeFormat is missing; every other language keeps the English form.
// Keyed by resolved locale first (Chinese differs by script), then by base language.
const RELATIVE_FALLBACKS: Record<string, {
  format: (value: number, unit: string) => string;
  now: string;
  units: Record<RelativeUnit, string>;
}> = {
  en: { format: (value, unit) => `${value} ${unit} ago`, now: 'now', units: { day: 'day', hour: 'hr', minute: 'min' } },
  ko: { format: (value, unit) => `${value}${unit} 전`, now: '지금', units: { day: '일', hour: '시간', minute: '분' } },
  ja: { format: (value, unit) => `${value}${unit}前`, now: '今', units: { day: '日', hour: '時間', minute: '分' } },
  'zh-CN': { format: (value, unit) => `${value}${unit}前`, now: '现在', units: { day: '天', hour: '小时', minute: '分钟' } },
  'zh-TW': { format: (value, unit) => `${value}${unit}前`, now: '現在', units: { day: '天', hour: '小時', minute: '分鐘' } },
  vi: { format: (value, unit) => `${value} ${unit} trước`, now: 'bây giờ', units: { day: 'ngày', hour: 'giờ', minute: 'phút' } },
};

const RELATIVE_NOW_ONLY: Record<string, string> = {
  th: 'ตอนนี้',
};

const formatRelativeMinutesFallback = (minutesAgo: number, language: string) => {
  const { unit, value } = resolveRelativeValue(minutesAgo);
  const baseLanguage = language.toLowerCase().split('-')[0];
  const fallback = RELATIVE_FALLBACKS[resolveLocale(language)] ?? RELATIVE_FALLBACKS[baseLanguage] ?? RELATIVE_FALLBACKS.en;

  if (value === 0) return RELATIVE_NOW_ONLY[baseLanguage] ?? fallback.now;
  return fallback.format(value, fallback.units[unit]);
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
