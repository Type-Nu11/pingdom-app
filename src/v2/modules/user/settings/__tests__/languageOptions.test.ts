import { supportedLanguages } from '../../../../shared/i18n';
import { resources } from '../../../../shared/i18n/resources';
import {
  getLanguageLabelKey,
  LANGUAGE_SETTING_OPTIONS,
  resolveSelectedLanguage,
} from '../model/languageOptions';

test('the settings picker lists every supported language exactly once', () => {
  expect([...LANGUAGE_SETTING_OPTIONS].sort()).toEqual([...supportedLanguages].sort());
  expect(new Set(LANGUAGE_SETTING_OPTIONS).size).toBe(LANGUAGE_SETTING_OPTIONS.length);
});

test('every option label resolves in every catalog', () => {
  for (const language of supportedLanguages) {
    const settings = resources[language].translation.settings.language as Record<string, string>;
    for (const option of LANGUAGE_SETTING_OPTIONS) {
      const key = getLanguageLabelKey(option).replace('settings.language.', '');
      expect(settings[key]).toBeTruthy();
    }
  }
});

test('the active language resolves ja variants and keeps the English default', () => {
  expect(resolveSelectedLanguage('ja')).toBe('ja');
  expect(resolveSelectedLanguage('ja-JP')).toBe('ja');
  expect(resolveSelectedLanguage('ko')).toBe('ko');
  expect(resolveSelectedLanguage(undefined)).toBe('en');
  expect(resolveSelectedLanguage('fr')).toBe('en');
});
