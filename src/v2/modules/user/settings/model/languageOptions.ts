import {
  DEFAULT_LANGUAGE,
  normalizeSupportedLanguage,
  type SupportedLanguage,
} from '../../../../shared/i18n';

/** Display order of the language picker; every supported language must appear exactly once. */
export const LANGUAGE_SETTING_OPTIONS = [
  'ko',
  'en',
  'ja',
  'zh-CN',
  'zh-TW',
  'vi',
  'es',
  'pt-BR',
] as const satisfies readonly SupportedLanguage[];

/** Resolves the active i18next language to a supported one, keeping the existing default. */
export function resolveSelectedLanguage(language: unknown): SupportedLanguage {
  return normalizeSupportedLanguage(language) ?? DEFAULT_LANGUAGE;
}
