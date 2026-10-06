import assert from 'node:assert/strict';
import test from 'node:test';
import { createInstance } from 'i18next';

import { resources } from '../resources.ts';
import { supportedLanguages } from '../../../shared/i18n/resources.ts';

// Every non-default language must mirror the default catalog so a missing key is caught here
// instead of being hidden by the English fallback at runtime.
const REFERENCE_LANGUAGE = 'en';
const SOURCE_LANGUAGES = [REFERENCE_LANGUAGE, 'ko'];
const JAPANESE_SCRIPT = /[぀-ヿ㐀-鿿]/u;
const HANGUL = /[ᄀ-ᇿ㄰-㆏가-힯]/u;
const KANA = /[぀-ヿ]/u;
const HAN = /[㐀-鿿]/u;

// High-frequency characters whose Simplified and Traditional forms differ. A Simplified form in
// zh-TW (or the reverse) means one catalog was reused for the other instead of being translated.
const CHINESE_VARIANT_PAIRS = [
  '这這', '们們', '为為', '时時', '来來', '对對', '说說', '还還', '过過', '发發', '经經', '现現', '点點', '边邊',
  '开開', '关關', '门門', '问問', '间間', '见見', '让讓', '请請', '选選', '择擇', '录錄', '设設', '应應', '获獲',
  '网網', '络絡', '确確', '认認', '务務', '码碼', '号號', '东東', '车車', '长長', '图圖', '书書', '页頁', '预預',
  '约約', '订訂', '单單', '优優', '态態', '验驗', '证證', '览覽', '历歷', '账帳', '语語', '记記', '数數', '据據',
  '标標', '类類', '试試', '输輸', '载載', '续續', '费費', '馆館', '购購', '厅廳',
];
const SIMPLIFIED_ONLY = new RegExp(`[${CHINESE_VARIANT_PAIRS.map(([simplified]) => simplified).join('')}]`, 'u');
const TRADITIONAL_ONLY = new RegExp(`[${CHINESE_VARIANT_PAIRS.map(([, traditional]) => traditional).join('')}]`, 'u');

// Brand names, units, and formatting-only values that every Latin-script language keeps as in English.
const LATIN_BRAND_AND_UNIT_KEYS = [
  'community.author',
  'map.recommendations.context.purpose.kPop',
  'mapTutorial.name',
  'visitVerification.distanceKm',
  'voiceAssistant.brand',
  'voiceAssistant.shortLabel',
];

// Brand names, units, and formatting-only values that stay in Latin script in Chinese.
const CHINESE_UNTRANSLATED_ALLOWLIST = [
  'community.author',
  'map.recommendations.context.purpose.kPop',
  'mapTutorial.name',
  'visitVerification.distanceKm',
  'voiceAssistant.brand',
  'voiceAssistant.shortLabel',
];

// Rules each translated language must satisfy on top of key parity.
// - nativeScript: a value with Latin words must also contain this script, unless allowlisted.
// - forbiddenScripts: scripts that would mean another language leaked into the catalog.
// - extraPluralCategories: CLDR plural categories the language has beyond English one/other.
// - untranslatedAllowlist: values intentionally kept in their original form (brand names, units,
//   formatting-only placeholders and fixed display labels).
const LANGUAGE_RULES = {
  ja: {
    forbiddenScripts: [HANGUL],
    nativeScript: JAPANESE_SCRIPT,
    untranslatedAllowlist: new Set([
      'community.author',
      'map.decision.livePicks',
      'map.recommendations.context.purpose.kPop',
      'map.search.confirm',
      'visitVerification.distanceKm',
      'voiceAssistant.brand',
      'voiceAssistant.shortLabel',
    ]),
  },
  'zh-CN': {
    forbiddenCharacters: TRADITIONAL_ONLY,
    forbiddenScripts: [HANGUL, KANA],
    nativeScript: HAN,
    untranslatedAllowlist: new Set(CHINESE_UNTRANSLATED_ALLOWLIST),
  },
  'zh-TW': {
    forbiddenCharacters: SIMPLIFIED_ONLY,
    forbiddenScripts: [HANGUL, KANA],
    nativeScript: HAN,
    untranslatedAllowlist: new Set(CHINESE_UNTRANSLATED_ALLOWLIST),
  },
  vi: {
    forbiddenScripts: [HANGUL, KANA, HAN],
    // Brand names plus loanwords Vietnamese keeps as written (Email, Pop-up, OK).
    untranslatedAllowlist: new Set([
      ...LATIN_BRAND_AND_UNIT_KEYS,
      'auth.signup.email',
      'map.search.confirm',
      'onboarding.preferences.travelPurposes.popUp',
      'settings.account.email',
    ]),
  },
  es: {
    // Spanish has a `many` category (1,000,000) besides one/other.
    extraPluralCategories: ['many'],
    forbiddenScripts: [HANGUL, KANA, HAN],
    // Brand names plus words Spanish spells like English (China, Vietnam, Info, Pop-up, Check-ins).
    untranslatedAllowlist: new Set([
      ...LATIN_BRAND_AND_UNIT_KEYS,
      'countries.cn',
      'countries.vn',
      'map.categories.popup',
      'map.detail.info',
      'map.recommendations.context.purpose.popUp',
      'onboarding.preferences.travelPurposes.popUp',
      'settings.support.checkInCount',
    ]),
  },
  'pt-BR': {
    // Portuguese has a `many` category (1,000,000) besides one/other.
    extraPluralCategories: ['many'],
    forbiddenScripts: [HANGUL, KANA, HAN],
    // Brand names plus words Brazilian Portuguese spells like English (China, Status, Info, OK, Pop-up).
    untranslatedAllowlist: new Set([
      ...LATIN_BRAND_AND_UNIT_KEYS,
      'countries.cn',
      'map.categories.popup',
      'map.detail.info',
      'map.recommendations.context.purpose.popUp',
      'map.search.confirm',
      'onboarding.preferences.travelPurposes.popUp',
      'reservation.detail.status',
      'settings.support.checkInCount',
    ]),
  },
};

// Language names in the picker are written in other languages' scripts on purpose.
const isLanguageName = (key) => key.startsWith('selectLanguage.options.');

const flatten = (value, prefix = '') => Object.entries(value).flatMap(([key, child]) => {
  const path = prefix ? `${prefix}.${key}` : key;
  return child && typeof child === 'object' ? flatten(child, path) : [[path, String(child)]];
});

const catalog = (language) => new Map(flatten(resources[language].translation));
const variables = (value) => [...value.matchAll(/{{\s*([^}]+?)\s*}}/g)].map((match) => match[1]).sort();
const tags = (value) => [...value.matchAll(/<\/?([a-z]+)>/g)].map((match) => match[0]).sort();
const lines = (value) => value.split('\n').length;
const withoutMarkup = (value) => value.replace(/{{[^}]*}}/g, '').replace(/<\/?[a-z]+>/g, '');

const reference = catalog(REFERENCE_LANGUAGE);
const korean = catalog('ko');
const otherLanguages = supportedLanguages.filter((language) => language !== REFERENCE_LANGUAGE);
const translatedLanguages = supportedLanguages.filter((language) => !SOURCE_LANGUAGES.includes(language));
const pluralBases = [...reference.keys()].filter((key) => key.endsWith('_other')).map((key) => key.slice(0, -'_other'.length));

// Keys a language adds for its own plural categories, e.g. `count_many` next to `count_other`.
const extraPluralKeys = (language) => (LANGUAGE_RULES[language]?.extraPluralCategories ?? [])
  .flatMap((category) => pluralBases.map((base) => `${base}_${category}`));

test('every supported language has an assembled catalog', () => {
  assert.deepEqual(Object.keys(resources).sort(), [...supportedLanguages].sort());
});

test('every translated language declares its translation rules', () => {
  assert.deepEqual(Object.keys(LANGUAGE_RULES).sort(), [...translatedLanguages].sort());
});

for (const language of otherLanguages) {
  test(`${language} catalog has exactly the ${REFERENCE_LANGUAGE} key set`, () => {
    const translated = catalog(language);
    const expected = new Set([...reference.keys(), ...extraPluralKeys(language)]);
    assert.deepEqual([...expected].filter((key) => !translated.has(key)), [], 'missing keys');
    assert.deepEqual([...translated.keys()].filter((key) => !expected.has(key)), [], 'unexpected keys');
  });

  test(`${language} catalog has no empty values`, () => {
    const empty = [...catalog(language)].filter(([, value]) => !value.trim()).map(([key]) => key);
    assert.deepEqual(empty, []);
  });

  test(`${language} interpolation variables and markup tags match the source copy`, () => {
    const mismatches = [];
    for (const [key, value] of catalog(language)) {
      // A language-specific plural form is compared with the `_other` source it extends.
      const sourceKey = reference.has(key) ? key : key.replace(/_[a-z]+$/, '_other');
      const source = reference.get(sourceKey);
      // Korean may legitimately interpolate a different unit than English (e.g. distance copy),
      // so a translation must match at least one of the existing source catalogs.
      const sources = [source, korean.get(sourceKey)];
      if (!sources.some((candidate) => variables(candidate).join() === variables(value).join())) {
        mismatches.push(`${key}: {{${variables(value)}}} vs {{${variables(source)}}}`);
      }
      if (tags(source).join() !== tags(value).join()) mismatches.push(`${key}: tags ${tags(value)} vs ${tags(source)}`);
    }
    assert.deepEqual(mismatches, []);
  });

  test(`${language} line breaks and edge whitespace match the source copy`, () => {
    const mismatches = [];
    for (const [key, value] of catalog(language)) {
      const source = reference.get(key);
      if (source === undefined) continue;
      if (/^\s/.test(source) !== /^\s/.test(value) || /\s$/.test(source) !== /\s$/.test(value)) mismatches.push(`${key}: edge whitespace`);
      // Multi-line copy is laid out per line, so a translation keeps a source catalog's line count.
      if (![source, korean.get(key)].some((candidate) => lines(candidate) === lines(value))) mismatches.push(`${key}: line count`);
    }
    assert.deepEqual(mismatches, []);
  });
}

for (const language of translatedLanguages) {
  const rules = LANGUAGE_RULES[language] ?? {};

  test(`${language} copy is translated and contains no other language`, () => {
    const translated = catalog(language);
    const allowlist = rules.untranslatedAllowlist ?? new Set();
    const leaked = [...translated]
      .filter(([key, value]) => !isLanguageName(key) && (rules.forbiddenScripts ?? []).some((script) => script.test(value)))
      .map(([key, value]) => `${key}=${value}`);
    assert.deepEqual(leaked, [], 'other-language script');

    const forbidden = rules.forbiddenCharacters;
    const wrongVariant = forbidden
      ? [...translated].filter(([key, value]) => !isLanguageName(key) && forbidden.test(value)).map(([key, value]) => `${key}=${value}`)
      : [];
    assert.deepEqual(wrongVariant, [], 'wrong script variant');

    const untranslated = [...translated]
      .filter(([key, value]) => {
        if (allowlist.has(key) || !/[A-Za-z]{2}/.test(withoutMarkup(value))) return false;
        // Non-Latin languages must use their own script; Latin ones must differ from English.
        return rules.nativeScript ? !rules.nativeScript.test(value) : value === reference.get(key);
      })
      .map(([key, value]) => `${key}=${value}`);
    assert.deepEqual(untranslated, []);
  });

  test(`${language} untranslated allowlist only names existing keys`, () => {
    const translated = catalog(language);
    assert.deepEqual([...(rules.untranslatedAllowlist ?? [])].filter((key) => !translated.has(key)), []);
  });

  test(`${language} plural forms resolve to its own copy for every count`, async () => {
    const instance = createInstance();
    await instance.init({
      fallbackLng: REFERENCE_LANGUAGE,
      interpolation: { escapeValue: false },
      lng: language,
      resources,
      supportedLngs: [...supportedLanguages],
    });
    assert.equal(instance.resolvedLanguage, language);
    const translated = catalog(language);
    const pluralRules = new Intl.PluralRules(language);
    const failures = [];
    for (const base of pluralBases) {
      for (const count of [0, 1, 2, 5, 11, 21, 100, 1000000]) {
        const rendered = instance.t(base, { count });
        // The exact form for the count's CLDR category, falling back to the bare key like i18next does.
        const category = pluralRules.select(count);
        const form = translated.get(`${base}_${category}`) ?? translated.get(base);
        if (form === undefined) { failures.push(`${base} has no ${category} form`); continue; }
        const expected = form.replace(/{{\s*count\s*}}/g, String(count));
        if (rendered !== expected) failures.push(`${base} count=${count}: ${rendered} != ${expected}`);
        if (!rendered.includes(String(count))) failures.push(`${base} count=${count} lost the number: ${rendered}`);
      }
    }
    assert.deepEqual(failures, []);
  });
}

test('#413 Simplified and Traditional Chinese are translated independently', () => {
  const simplified = catalog('zh-CN');
  const traditional = catalog('zh-TW');
  const comparable = [...simplified].filter(([key, value]) => !isLanguageName(key) && HAN.test(value));
  const identical = comparable.filter(([key, value]) => traditional.get(key) === value);
  // Short labels such as 返回 or 全部 are legitimately the same; whole catalogs must not be.
  assert.ok(identical.length < comparable.length * 0.2, `${identical.length}/${comparable.length} identical values`);
  assert.equal(simplified.get('selectLanguage.options.zh-CN'), '简体中文');
  assert.equal(traditional.get('selectLanguage.options.zh-TW'), '繁體中文');
});

test('language option labels exist for every supported language', () => {
  const endonyms = supportedLanguages.map((language) => resources[language].translation.selectLanguage.options[language]);
  assert.equal(new Set(endonyms).size, supportedLanguages.length, 'each language has a distinct own name');
  assert.equal(resources.ja.translation.selectLanguage.options.ja, '日本語');
  // The catalogs that shipped before #413 show Japanese by its own name; later ones localize it for search.
  for (const language of ['en', 'ko']) assert.equal(resources[language].translation.selectLanguage.options.ja, '日本語', language);
  for (const language of supportedLanguages) {
    const options = resources[language].translation.selectLanguage.options;
    assert.deepEqual(Object.keys(options).sort(), [...supportedLanguages].sort(), language);
  }
});
