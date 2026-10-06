export type ParsedLocale = Readonly<{ language: string; region?: string; script?: string }>;

// Splits `zh_Hant-TW`-style tags into language, script (4 letters), and region (2 letters or 3 digits).
export function parseLocale(value: string): ParsedLocale {
  const [language = '', ...subtags] = value.trim().toLowerCase().replace(/_/g, '-').split('-');
  return {
    language,
    region: subtags.find((subtag) => /^([a-z]{2}|\d{3})$/.test(subtag))?.toUpperCase(),
    script: subtags.find((subtag) => /^[a-z]{4}$/.test(subtag)),
  };
}

// Regions that write Chinese in Traditional script when the locale names no script.
const TRADITIONAL_CHINESE_REGIONS = new Set(['TW', 'HK', 'MO']);

// An explicit script wins over the region (`zh-Hans-TW` is Simplified). Without either,
// bare `zh` and every other region (`CN`, `SG`, `MY`, …) are Simplified.
export function isTraditionalChinese(locale: ParsedLocale): boolean {
  if (locale.language !== 'zh') return false;
  if (locale.script) return locale.script === 'hant';
  return locale.region !== undefined && TRADITIONAL_CHINESE_REGIONS.has(locale.region);
}
