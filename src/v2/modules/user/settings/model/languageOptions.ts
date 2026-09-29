import {
  DEFAULT_LANGUAGE,
  normalizeSupportedLanguage,
  type SupportedLanguage,
} from '../../../../shared/i18n';

/** Display order of the language picker; every supported language must appear exactly once. */
export const LANGUAGE_SETTING_OPTIONS = ['ko', 'en'] as const satisfies readonly SupportedLanguage[];

// A Record keeps the label table exhaustive when a language is added to the shared catalog.
const LANGUAGE_LABEL_KEYS: Record<SupportedLanguage, string> = {
  en: 'settings.language.english',
  ko: 'settings.language.korean',
};

export function getLanguageLabelKey(language: SupportedLanguage): string {
  return LANGUAGE_LABEL_KEYS[language];
}

/** Resolves the active i18next language to a supported one, keeping the existing default. */
export function resolveSelectedLanguage(language: unknown): SupportedLanguage {
  return normalizeSupportedLanguage(language) ?? DEFAULT_LANGUAGE;
}
