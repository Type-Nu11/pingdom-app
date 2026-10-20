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
  for (const value of ['jp', 'jav', 'fr-FR', '', null, undefined, 81]) {
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

// #413 Chinese: Simplified (zh-CN) and Traditional (zh-TW) are separate choices.
const SIMPLIFIED_CHINESE_LOCALES = [
  'zh', 'ZH', 'zh-CN', 'zh_CN', ' zh-cn ', 'zh-Hans', 'zh_Hans', 'zh-Hans-CN', 'zh_Hans_SG', 'zh-SG', 'zh-MY',
  'zh-Hans-TW', 'zh-Hans-HK', 'zh-Hans-MO', 'zh-US', 'Chinese', 'Simplified Chinese', '简体中文', '中文', '중국어',
];
const TRADITIONAL_CHINESE_LOCALES = [
  'zh-TW', 'zh_TW', 'ZH-tw', 'zh-Hant', 'zh_Hant', 'zh-Hant-TW', 'zh-HK', 'zh-MO', 'zh-Hant-HK', 'zh_Hant_MO',
  'zh-Hant-CN', 'zh-Hant-SG', 'Traditional Chinese', '繁體中文', '중국어(번체)',
];

test('#413 Chinese locales split into zh-CN and zh-TW by script first, then region', () => {
  for (const value of SIMPLIFIED_CHINESE_LOCALES) assert.equal(normalizeSupportedLanguage(value), 'zh-CN', value);
  for (const value of TRADITIONAL_CHINESE_LOCALES) assert.equal(normalizeSupportedLanguage(value), 'zh-TW', value);
  // Not Chinese-language tags: region codes alone, ISO 639-2, and Cantonese stay unmapped.
  for (const value of ['cn', 'tw', 'hk', 'zho', 'chi', 'yue-HK', 'zh1']) {
    assert.equal(normalizeSupportedLanguage(value), null, value);
  }
});

test('#413 a chosen Simplified or Traditional variant is never overwritten by the other', () => {
  assert.equal(resolvePreferredLanguage({ storedLanguage: 'zh-TW', profileLanguage: 'zh-CN', deviceLanguage: 'zh-Hans-CN' }), 'zh-TW');
  assert.equal(resolvePreferredLanguage({ storedLanguage: 'zh-CN', profileLanguage: 'zh-TW', deviceLanguage: 'zh-Hant-TW' }), 'zh-CN');
  assert.equal(resolvePreferredLanguage({ profileLanguage: 'zh-TW', deviceLanguage: 'zh-CN' }), 'zh-TW');
  assert.equal(resolvePreferredLanguage({ profileLanguage: 'zh-CN', deviceLanguage: 'zh-HK' }), 'zh-CN');
  assert.equal(resolvePreferredLanguage({ deviceLanguage: 'zh-Hant-HK' }), 'zh-TW');
  assert.equal(resolvePreferredLanguage({ deviceLanguage: 'zh-Hans-SG' }), 'zh-CN');
  // Existing languages keep their priority against Chinese profile/device values.
  assert.equal(resolvePreferredLanguage({ storedLanguage: 'ko', profileLanguage: 'zh-CN', deviceLanguage: 'zh-TW' }), 'ko');
  assert.equal(resolvePreferredLanguage({ storedLanguage: 'zh-TW', profileLanguage: 'ko', deviceLanguage: 'ja-JP' }), 'zh-TW');
});

test('#413 restores the exact stored Chinese variant and maps a legacy zh value to zh-CN', async () => {
  const restore = (stored, deviceLanguage, profileLanguage) => restorePreferredLanguage({
    deviceLanguage,
    profileLanguage,
    storage: { getItem: async () => stored, setItem: async () => {} },
    storageKey: 'language',
  });
  assert.deepEqual(await restore('zh-TW', 'zh-Hans-CN', 'zh-CN'), { hasStoredPreference: true, language: 'zh-TW' });
  assert.deepEqual(await restore('zh-CN', 'zh-Hant-TW', 'zh-TW'), { hasStoredPreference: true, language: 'zh-CN' });
  assert.deepEqual(await restore('zh', 'zh-Hant-TW', 'ko'), { hasStoredPreference: true, language: 'zh-CN' });
  assert.deepEqual(await restore(null, 'zh-Hant-TW', undefined), { hasStoredPreference: false, language: 'zh-TW' });
});

test('#413 selecting a Chinese variant applies and persists that exact code', async () => {
  for (const language of ['zh-CN', 'zh-TW']) {
    const calls = [];
    const persisted = await applyLanguagePreference({
      changeLanguage: async (next) => { calls.push(`change:${next}`); },
      language,
      persist: async (next) => { calls.push(`persist:${next}`); },
    });
    assert.equal(persisted, true);
    assert.deepEqual(calls, [`change:${language}`, `persist:${language}`]);
  }
});

test('#414 normalizes Vietnamese codes, regional variants, and language names to vi', () => {
  for (const value of ['vi', 'VI', 'vi-VN', 'vi_VN', ' vi-vn ', 'vi-Latn-VN', 'vi-US', 'Vietnamese', 'Tiếng Việt', '베트남어']) {
    assert.equal(normalizeSupportedLanguage(value), 'vi', value);
  }
  for (const value of ['vn', 'vie', 'vietnam', 'v']) {
    assert.equal(normalizeSupportedLanguage(value), null, value);
  }
});

test('#414 a stored explicit choice is never overridden by a Vietnamese profile or device', () => {
  assert.equal(resolvePreferredLanguage({ storedLanguage: 'ko', profileLanguage: 'vi', deviceLanguage: 'vi-VN' }), 'ko');
  assert.equal(resolvePreferredLanguage({ storedLanguage: 'vi', profileLanguage: 'ko', deviceLanguage: 'en-US' }), 'vi');
  assert.equal(resolvePreferredLanguage({ profileLanguage: 'vi', deviceLanguage: 'ko-KR' }), 'vi');
  assert.equal(resolvePreferredLanguage({ profileLanguage: 'ja', deviceLanguage: 'vi-VN' }), 'ja');
  assert.equal(resolvePreferredLanguage({ deviceLanguage: 'vi-VN' }), 'vi');
});

test('#414 restores a stored vi or vi-VN preference and applies it before persistence', async () => {
  for (const stored of ['vi', 'vi-VN']) {
    const result = await restorePreferredLanguage({
      deviceLanguage: 'en-US',
      profileLanguage: 'ko',
      storage: { getItem: async () => stored, setItem: async () => {} },
      storageKey: 'language',
    });
    assert.deepEqual(result, { hasStoredPreference: true, language: 'vi' }, stored);
  }
  const calls = [];
  const persisted = await applyLanguagePreference({
    changeLanguage: async (language) => { calls.push(`change:${language}`); },
    language: 'vi',
    persist: async (language) => { calls.push(`persist:${language}`); throw new Error('quota'); },
  });
  assert.equal(persisted, false);
  assert.deepEqual(calls, ['change:vi', 'persist:vi']);
});

test('#415 normalizes Spanish locales and language names to es', () => {
  for (const value of ["es", "ES", "es-ES", "es_ES", " es-es ", "es-419", "es-MX", "es-US", "es-AR", "es-CO", "es-Latn-ES", "Spanish", "Español", "스페인어"]) {
    assert.equal(normalizeSupportedLanguage(value), 'es', value);
  }
  for (const value of ["esp", "spa", "ca-ES", "gl-ES", "eu-ES", "e"]) {
    assert.equal(normalizeSupportedLanguage(value), null, value);
  }
});

test('#415 a stored explicit choice is never overridden by a Spanish profile or device', () => {
  assert.equal(resolvePreferredLanguage({ storedLanguage: 'ko', profileLanguage: 'es', deviceLanguage: 'es-MX' }), 'ko');
  assert.equal(resolvePreferredLanguage({ storedLanguage: 'es', profileLanguage: 'ko', deviceLanguage: 'en-US' }), 'es');
  assert.equal(resolvePreferredLanguage({ profileLanguage: 'es', deviceLanguage: 'ko-KR' }), 'es');
  assert.equal(resolvePreferredLanguage({ profileLanguage: 'ja', deviceLanguage: 'es-MX' }), 'ja');
  assert.equal(resolvePreferredLanguage({ deviceLanguage: 'es-MX' }), 'es');
});

test('#415 restores a stored es preference and applies the choice before persistence', async () => {
  for (const stored of ["es", "es-ES", "es-419"]) {
    const result = await restorePreferredLanguage({
      deviceLanguage: 'en-US',
      profileLanguage: 'ko',
      storage: { getItem: async () => stored, setItem: async () => {} },
      storageKey: 'language',
    });
    assert.deepEqual(result, { hasStoredPreference: true, language: 'es' }, stored);
  }
  const calls = [];
  const persisted = await applyLanguagePreference({
    changeLanguage: async (language) => { calls.push(`change:${language}`); },
    language: 'es',
    persist: async (language) => { calls.push(`persist:${language}`); throw new Error('quota'); },
  });
  assert.equal(persisted, false);
  assert.deepEqual(calls, ['change:es', 'persist:es']);
});

test('#416 normalizes Brazilian Portuguese locales and language names to pt-BR', () => {
  for (const value of ["pt", "PT", "pt-BR", "pt_BR", " pt-br ", "pt-Latn-BR", "pt-Latn", "Brazilian Portuguese", "Português (Brasil)", "포르투갈어(브라질)"]) {
    assert.equal(normalizeSupportedLanguage(value), 'pt-BR', value);
  }
  for (const value of ["pt-PT", "pt_PT", "PT-pt", "pt-Latn-PT", "pt-AO", "pt-MZ", "por", "br", "portuguese", "português"]) {
    assert.equal(normalizeSupportedLanguage(value), null, value);
  }
});

test('#416 a pt-PT device or profile is never mapped to pt-BR and follows the existing fallback', () => {
  assert.equal(resolvePreferredLanguage({ deviceLanguage: 'pt-PT' }), 'en');
  assert.equal(resolvePreferredLanguage({ profileLanguage: 'ko', deviceLanguage: 'pt-PT' }), 'ko');
  assert.equal(resolvePreferredLanguage({ profileLanguage: 'pt-PT', deviceLanguage: 'ja-JP' }), 'ja');
  assert.equal(resolvePreferredLanguage({ profileLanguage: 'pt-PT', deviceLanguage: 'pt-BR' }), 'pt-BR');
  // Choosing pt-BR explicitly in settings is allowed and survives a pt-PT device.
  assert.equal(resolvePreferredLanguage({ storedLanguage: 'pt-BR', profileLanguage: 'pt-PT', deviceLanguage: 'pt-PT' }), 'pt-BR');
});

test('#416 an unsupported stored pt-PT value is ignored instead of being read as pt-BR', async () => {
  const result = await restorePreferredLanguage({
    deviceLanguage: 'pt-PT',
    storage: { getItem: async () => 'pt-PT', setItem: async () => {} },
    storageKey: 'language',
  });
  assert.deepEqual(result, { hasStoredPreference: false, language: 'en' });
});

test('#416 a stored explicit choice is never overridden by a Brazilian Portuguese profile or device', () => {
  assert.equal(resolvePreferredLanguage({ storedLanguage: 'ko', profileLanguage: 'pt-BR', deviceLanguage: 'pt-BR' }), 'ko');
  assert.equal(resolvePreferredLanguage({ storedLanguage: 'pt-BR', profileLanguage: 'ko', deviceLanguage: 'en-US' }), 'pt-BR');
  assert.equal(resolvePreferredLanguage({ profileLanguage: 'pt-BR', deviceLanguage: 'ko-KR' }), 'pt-BR');
  assert.equal(resolvePreferredLanguage({ profileLanguage: 'ja', deviceLanguage: 'pt-BR' }), 'ja');
  assert.equal(resolvePreferredLanguage({ deviceLanguage: 'pt-BR' }), 'pt-BR');
});

test('#416 restores a stored pt-BR preference and applies the choice before persistence', async () => {
  for (const stored of ["pt-BR", "pt", "pt_BR"]) {
    const result = await restorePreferredLanguage({
      deviceLanguage: 'en-US',
      profileLanguage: 'ko',
      storage: { getItem: async () => stored, setItem: async () => {} },
      storageKey: 'language',
    });
    assert.deepEqual(result, { hasStoredPreference: true, language: 'pt-BR' }, stored);
  }
  const calls = [];
  const persisted = await applyLanguagePreference({
    changeLanguage: async (language) => { calls.push(`change:${language}`); },
    language: 'pt-BR',
    persist: async (language) => { calls.push(`persist:${language}`); throw new Error('quota'); },
  });
  assert.equal(persisted, false);
  assert.deepEqual(calls, ['change:pt-BR', 'persist:pt-BR']);
});
