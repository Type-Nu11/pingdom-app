import { DEFAULT_LANGUAGE, getLanguageEndonym, supportedLanguages } from '../../../../../shared/i18n';
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
      endonym: getLanguageEndonym(code),
      labelKey: `selectLanguage.options.${code}`,
    })));
    expect(INITIAL_SELECTED_LANGUAGE).toBe(DEFAULT_LANGUAGE);
  });


  test('자체 표기와 현재 UI 언어 이름을 대소문자 구분 없이 거른다', () => {
    const labels: Record<string, string> = {
      'selectLanguage.options.en': 'English',
      'selectLanguage.options.ja': 'Japanese',
      'selectLanguage.options.ko': 'Korean',
    };
    const options = getLanguageOptions();
    const translate = (key: string) => labels[key] ?? '';
    expect(filterLanguageOptions(options, 'ENG', translate).map((o) => o.code))
      .toEqual(['en']);
    expect(filterLanguageOptions(options, 'korean', translate).map((o) => o.code))
      .toEqual(['ko']);
    expect(filterLanguageOptions(options, '한국', translate).map((o) => o.code))
      .toEqual(['ko']);
    expect(filterLanguageOptions(options, '日本', translate).map((o) => o.code))
      .toEqual(['ja']);
    expect(filterLanguageOptions(options, '', translate)).toHaveLength(options.length);
    expect(filterLanguageOptions(options, 'xyz', translate)).toEqual([]);
  });
});
