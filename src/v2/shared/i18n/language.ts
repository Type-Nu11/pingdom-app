import { isBrazilianPortuguese, isTraditionalChinese, parseLocale, type ParsedLocale } from './locale';
import { resources, supportedLanguages, type SupportedLanguage } from './resources';

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export interface LanguageStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === 'string'
    && supportedLanguages.includes(value as SupportedLanguage);
}

type LanguageDefinition = Readonly<{
  // Language names that stored profiles or legacy selections may carry instead of a code.
  aliases: readonly string[];
  // Whether a BCP 47 locale (device, profile, or stored value) selects this language.
  matchesLocale: (locale: ParsedLocale) => boolean;
}>;

const matchesLanguage = (language: string) => (locale: ParsedLocale) => locale.language === language;

// Every supported language declares its own locale mapping here, so a locale that no
// definition claims falls through to the existing profile/device/default order.
const LANGUAGE_DEFINITIONS: Record<SupportedLanguage, LanguageDefinition> = {
  en: { aliases: ['english', '영어'], matchesLocale: matchesLanguage('en') },
  ko: { aliases: ['korean', '한국어'], matchesLocale: matchesLanguage('ko') },
  ja: { aliases: ['japanese', '日本語', '일본어'], matchesLocale: matchesLanguage('ja') },
  // Chinese is split by script: see isTraditionalChinese for the script/region mapping.
  'zh-CN': {
    aliases: ['chinese', 'simplified chinese', 'chinese (simplified)', '简体中文', '中文', '중국어', '중국어(간체)'],
    matchesLocale: (locale) => locale.language === 'zh' && !isTraditionalChinese(locale),
  },
  'zh-TW': {
    aliases: ['traditional chinese', 'chinese (traditional)', '繁體中文', '중국어(번체)'],
    matchesLocale: isTraditionalChinese,
  },
  vi: { aliases: ['vietnamese', 'tiếng việt', '베트남어'], matchesLocale: matchesLanguage('vi') },
  // One neutral Spanish catalog serves every region (es-ES, es-419, es-MX, …).
  es: { aliases: ['spanish', 'español', '스페인어'], matchesLocale: matchesLanguage('es') },
  // Only bare `pt` and `pt-BR` select Brazilian Portuguese. `pt-PT` and other regions are left
  // unmatched on purpose, so they follow the profile/device/default order instead.
  'pt-BR': {
    aliases: ['brazilian portuguese', 'portuguese (brazil)', 'português (brasil)', 'português do brasil', '포르투갈어(브라질)'],
    matchesLocale: isBrazilianPortuguese,
  },
};

// Each language is named in its own script (English, 한국어, 日本語), taken from
// that language's own catalog so a new language needs no extra table.
export function getLanguageEndonym(language: SupportedLanguage): string {
  return resources[language].translation.selectLanguage.options[language];
}

export function normalizeSupportedLanguage(value: unknown): SupportedLanguage | null {
  if (typeof value !== 'string') return null;

  const normalized = value.trim().toLowerCase();
  const locale = parseLocale(normalized);
  return supportedLanguages.find((language) => {
    const definition = LANGUAGE_DEFINITIONS[language];
    return definition.matchesLocale(locale) || definition.aliases.includes(normalized);
  }) ?? null;
}

export function detectDeviceLanguage(): SupportedLanguage | null {
  try {
    return normalizeSupportedLanguage(Intl.DateTimeFormat().resolvedOptions().locale);
  } catch {
    return null;
  }
}

export function resolvePreferredLanguage({
  deviceLanguage,
  profileLanguage,
  storedLanguage,
}: {
  deviceLanguage?: unknown;
  profileLanguage?: unknown;
  storedLanguage?: unknown;
}): SupportedLanguage {
  return normalizeSupportedLanguage(storedLanguage)
    ?? normalizeSupportedLanguage(profileLanguage)
    ?? normalizeSupportedLanguage(deviceLanguage)
    ?? DEFAULT_LANGUAGE;
}

export async function restorePreferredLanguage({
  deviceLanguage,
  profileLanguage,
  storage,
  storageKey,
}: {
  deviceLanguage?: unknown;
  profileLanguage?: unknown;
  storage: LanguageStorage;
  storageKey: string;
}): Promise<{ hasStoredPreference: boolean; language: SupportedLanguage }> {
  let storedLanguage: string | null = null;
  try {
    storedLanguage = await storage.getItem(storageKey);
  } catch {
    // Storage availability must never prevent app startup.
  }
  const normalizedStoredLanguage = normalizeSupportedLanguage(storedLanguage);
  return {
    hasStoredPreference: normalizedStoredLanguage !== null,
    language: resolvePreferredLanguage({
      deviceLanguage,
      profileLanguage,
      storedLanguage: normalizedStoredLanguage,
    }),
  };
}

export async function applyLanguagePreference({
  changeLanguage,
  language,
  persist,
}: {
  changeLanguage: (language: SupportedLanguage) => Promise<unknown>;
  language: SupportedLanguage;
  persist: (language: SupportedLanguage) => Promise<unknown>;
}): Promise<boolean> {
  await changeLanguage(language);
  try {
    await persist(language);
    return true;
  } catch {
    return false;
  }
}
