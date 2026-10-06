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

test('#413 the active language keeps the Simplified/Traditional variant apart', () => {
  expect(LANGUAGE_SETTING_OPTIONS).toEqual(expect.arrayContaining(['zh-CN', 'zh-TW']));
  expect(resolveSelectedLanguage('zh-CN')).toBe('zh-CN');
  expect(resolveSelectedLanguage('zh-TW')).toBe('zh-TW');
  expect(resolveSelectedLanguage('zh-Hant-HK')).toBe('zh-TW');
  expect(resolveSelectedLanguage('zh')).toBe('zh-CN');
});

test('#414 the active language resolves vi variants', () => {
  expect(LANGUAGE_SETTING_OPTIONS).toContain('vi');
  expect(resolveSelectedLanguage('vi')).toBe('vi');
  expect(resolveSelectedLanguage('vi-VN')).toBe('vi');
});
