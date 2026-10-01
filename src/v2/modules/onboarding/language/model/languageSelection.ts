import {
  DEFAULT_LANGUAGE,
  getLanguageEndonym,
  supportedLanguages,
  type SupportedLanguage,
} from '../../../../shared/i18n';

export type LanguageOption = Readonly<{
  code: SupportedLanguage;
  // Shown label: the language's own name, whatever the current UI language is.
  endonym: string;
  // Name in the current UI language, kept so searching it still matches.
  labelKey: `selectLanguage.options.${SupportedLanguage}`;
}>;

export const INITIAL_SELECTED_LANGUAGE: SupportedLanguage = DEFAULT_LANGUAGE;

// Options follow the shared i18n list, so adding a language needs no edit here.
export function getLanguageOptions(): LanguageOption[] {
  return supportedLanguages.map((code) => ({
    code,
    endonym: getLanguageEndonym(code),
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
    [option.endonym, translate(option.labelKey)]
      .some((name) => name.toLowerCase().includes(normalizedQuery)),
  );
}
