import { DEFAULT_LANGUAGE, supportedLanguages, type SupportedLanguage } from '../../../../../shared/i18n';
import {
  INITIAL_SELECTED_LANGUAGE,
  filterLanguageOptions,
  getLanguageOptions,
} from '../languageSelection';

describe('languageSelection', () => {
  test('기본 옵션은 supportedLanguages에서만 파생한다', () => {
    expect(getLanguageOptions().map((option) => option.code)).toEqual([...supportedLanguages]);
    expect(getLanguageOptions()).toEqual(supportedLanguages.map((code) => ({
      code,
      labelKey: `selectLanguage.options.${code}`,
    })));
    expect(INITIAL_SELECTED_LANGUAGE).toBe(DEFAULT_LANGUAGE);
  });

  test('주어진 언어 목록이 늘어나면 옵션도 함께 늘어난다', () => {
    const extended = [...supportedLanguages, 'zh'] as unknown as SupportedLanguage[];
    expect(getLanguageOptions(extended).map((option) => option.code)).toEqual(extended);
  });

  test('번역된 이름을 대소문자 구분 없이 거른다', () => {
    const labels: Record<string, string> = {
      'selectLanguage.options.en': 'English',
      'selectLanguage.options.ja': '日本語',
      'selectLanguage.options.ko': 'Korean',
    };
    const options = getLanguageOptions();
    expect(filterLanguageOptions(options, 'ENG', (key) => labels[key]).map((o) => o.code))
      .toEqual(['en']);
    expect(filterLanguageOptions(options, '', (key) => labels[key])).toHaveLength(options.length);
    expect(filterLanguageOptions(options, 'xyz', (key) => labels[key])).toEqual([]);
  });
});
