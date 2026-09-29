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
  assert.equal(normalizeSupportedLanguage('ja-JP'), 'ja');
  assert.equal(normalizeSupportedLanguage('fr-FR'), null);
});

test('resolves stored, profile, device, and default language in priority order', () => {
  assert.equal(resolvePreferredLanguage({ storedLanguage: 'ko', profileLanguage: 'en', deviceLanguage: 'en' }), 'ko');
  assert.equal(resolvePreferredLanguage({ profileLanguage: 'ko', deviceLanguage: 'en' }), 'ko');
  assert.equal(resolvePreferredLanguage({ deviceLanguage: 'ko-KR' }), 'ko');
  assert.equal(resolvePreferredLanguage({ deviceLanguage: 'ja-JP' }), 'ja');
  assert.equal(resolvePreferredLanguage({ deviceLanguage: 'fr-FR' }), 'en');
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

test('normalizes Japanese codes, regional variants, and language names to ja', () => {
  for (const value of ['ja', 'JA', 'ja-JP', 'ja_JP', ' ja-jp ', 'Japanese', '日本語', '일본어']) {
    assert.equal(normalizeSupportedLanguage(value), 'ja', value);
  }
  for (const value of ['jp', 'jav', 'zh-CN', '', null, undefined, 81]) {
    assert.equal(normalizeSupportedLanguage(value), null, String(value));
  }
});

test('a stored explicit choice is never overridden by a Japanese profile or device', () => {
  assert.equal(resolvePreferredLanguage({ storedLanguage: 'ko', profileLanguage: 'ja', deviceLanguage: 'ja-JP' }), 'ko');
  assert.equal(resolvePreferredLanguage({ storedLanguage: 'en', deviceLanguage: 'ja-JP' }), 'en');
  assert.equal(resolvePreferredLanguage({ storedLanguage: 'ja', profileLanguage: 'ko', deviceLanguage: 'en-US' }), 'ja');
  assert.equal(resolvePreferredLanguage({ profileLanguage: 'ja', deviceLanguage: 'ko-KR' }), 'ja');
  assert.equal(resolvePreferredLanguage({ profileLanguage: 'en', deviceLanguage: 'ja-JP' }), 'en');
});

test('restores a stored ja or ja-JP preference and ignores an unsupported stored value', async () => {
  for (const stored of ['ja', 'ja-JP']) {
    const result = await restorePreferredLanguage({
      deviceLanguage: 'en-US',
      profileLanguage: 'ko',
      storage: { getItem: async () => stored, setItem: async () => {} },
      storageKey: 'language',
    });
    assert.deepEqual(result, { hasStoredPreference: true, language: 'ja' }, stored);
  }

  const unsupported = await restorePreferredLanguage({
    deviceLanguage: 'ja-JP',
    storage: { getItem: async () => 'fr', setItem: async () => {} },
    storageKey: 'language',
  });
  assert.deepEqual(unsupported, { hasStoredPreference: false, language: 'ja' });
});

test('storage read failure falls through to the Japanese device language', async () => {
  const result = await restorePreferredLanguage({
    deviceLanguage: 'ja-JP',
    storage: { getItem: async () => { throw new Error('unavailable'); }, setItem: async () => {} },
    storageKey: 'language',
  });
  assert.deepEqual(result, { hasStoredPreference: false, language: 'ja' });
});

test('selecting ja applies it immediately and keeps it when persistence fails', async () => {
  const calls = [];
  const persisted = await applyLanguagePreference({
    changeLanguage: async (language) => { calls.push(`change:${language}`); },
    language: 'ja',
    persist: async (language) => { calls.push(`persist:${language}`); throw new Error('quota'); },
  });
  assert.equal(persisted, false);
  assert.deepEqual(calls, ['change:ja', 'persist:ja']);
});
