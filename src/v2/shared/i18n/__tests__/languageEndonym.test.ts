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

describe('#413 중국어 자체 표기', () => {
  test('간체와 번체를 각각의 문자로 구분해 표기한다', () => {
    expect(getLanguageEndonym('zh-CN')).toBe('简体中文');
    expect(getLanguageEndonym('zh-TW')).toBe('繁體中文');
  });
});
