import { supportedLanguages } from '../../../../shared/i18n';
import {
  LANGUAGE_SETTING_OPTIONS,
  resolveSelectedLanguage,
} from '../model/languageOptions';

test('the settings picker lists every supported language exactly once', () => {
  expect([...LANGUAGE_SETTING_OPTIONS].sort()).toEqual([...supportedLanguages].sort());
  expect(new Set(LANGUAGE_SETTING_OPTIONS).size).toBe(LANGUAGE_SETTING_OPTIONS.length);
});


test('the active language resolves ja variants and keeps the English default', () => {
  expect(resolveSelectedLanguage('ja')).toBe('ja');
  expect(resolveSelectedLanguage('ja-JP')).toBe('ja');
  expect(resolveSelectedLanguage('ko')).toBe('ko');
  expect(resolveSelectedLanguage(undefined)).toBe('en');
  expect(resolveSelectedLanguage('fr')).toBe('en');
});
