import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyLanguagePreference,
  normalizeSupportedLanguage,
  resolvePreferredLanguage,
  restorePreferredLanguage,
} from '../../../v2/shared/i18n/language.ts';

test('normalizes supported locale variants and rejects unsupported languages', () => {
  assert.equal(normalizeSupportedLanguage('ko-KR'), 'ko');
  assert.equal(normalizeSupportedLanguage('en_US'), 'en');
  assert.equal(normalizeSupportedLanguage('ja-JP'), null);
});

test('resolves stored, profile, device, and default language in priority order', () => {
  assert.equal(resolvePreferredLanguage({ storedLanguage: 'ko', profileLanguage: 'en', deviceLanguage: 'en' }), 'ko');
  assert.equal(resolvePreferredLanguage({ profileLanguage: 'ko', deviceLanguage: 'en' }), 'ko');
  assert.equal(resolvePreferredLanguage({ deviceLanguage: 'ko-KR' }), 'ko');
  assert.equal(resolvePreferredLanguage({ deviceLanguage: 'ja-JP' }), 'en');
});

test('restores a persisted language across app initialization', async () => {
  const storage = { getItem: async () => 'ko', setItem: async () => {} };
  const result = await restorePreferredLanguage({
    deviceLanguage: 'en',
    profileLanguage: 'en',
    storage,
    storageKey: 'language',
  });
  assert.deepEqual(result, { hasStoredPreference: true, language: 'ko' });
});

test('storage read failure falls through without blocking startup', async () => {
  const storage = { getItem: async () => { throw new Error('unavailable'); }, setItem: async () => {} };
  const result = await restorePreferredLanguage({
    deviceLanguage: 'en',
    profileLanguage: 'ko',
    storage,
    storageKey: 'language',
  });
  assert.deepEqual(result, { hasStoredPreference: false, language: 'ko' });
});

test('changes the UI before persistence and keeps the change when persistence fails', async () => {
  const calls = [];
  const persisted = await applyLanguagePreference({
    changeLanguage: async (language) => { calls.push(`change:${language}`); },
    language: 'ko',
    persist: async (language) => { calls.push(`persist:${language}`); throw new Error('full'); },
  });
  assert.equal(persisted, false);
  assert.deepEqual(calls, ['change:ko', 'persist:ko']);
});
