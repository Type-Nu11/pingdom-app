import { getLanguageEndonym, supportedLanguages } from '..';
import { resources } from '../resources';

describe('getLanguageEndonym', () => {
  test('각 언어를 그 언어 자체 표기로 돌려준다', () => {
    expect(getLanguageEndonym('en')).toBe('English');
    expect(getLanguageEndonym('ko')).toBe('한국어');
    expect(getLanguageEndonym('ja')).toBe('日本語');
  });

  test('모든 지원 언어의 자체 표기를 그 언어 카탈로그에서 가져온다', () => {
    for (const language of supportedLanguages) {
      expect(getLanguageEndonym(language))
        .toBe(resources[language].translation.selectLanguage.options[language]);
    }
  });
});
