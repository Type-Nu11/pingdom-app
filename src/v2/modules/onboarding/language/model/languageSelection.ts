import {
  DEFAULT_LANGUAGE,
  supportedLanguages,
  type SupportedLanguage,
} from '../../../../shared/i18n';

export type LanguageOption = Readonly<{
  code: SupportedLanguage;
  labelKey: `selectLanguage.options.${SupportedLanguage}`;
}>;

export const INITIAL_SELECTED_LANGUAGE: SupportedLanguage = DEFAULT_LANGUAGE;

// Options follow the shared i18n list, so adding a language needs no edit here.
export function getLanguageOptions(
  languages: readonly SupportedLanguage[] = supportedLanguages,
): LanguageOption[] {
  return languages.map((code) => ({
    code,
    labelKey: `selectLanguage.options.${code}`,
  }));
}

export function filterLanguageOptions(
  options: readonly LanguageOption[],
  query: string,
  translate: (key: LanguageOption['labelKey']) => string,
): LanguageOption[] {
  const normalizedQuery = query.toLowerCase();
  return options.filter((option) =>
    translate(option.labelKey).toLowerCase().includes(normalizedQuery),
  );
}
