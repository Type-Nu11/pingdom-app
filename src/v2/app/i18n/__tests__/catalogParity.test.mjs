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
};

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
      .filter(([, value]) => (rules.forbiddenScripts ?? []).some((script) => script.test(value)))
      .map(([key, value]) => `${key}=${value}`);
    assert.deepEqual(leaked, [], 'other-language script');

    const forbidden = rules.forbiddenCharacters;
    const wrongVariant = forbidden
      ? [...translated].filter(([, value]) => forbidden.test(value)).map(([key, value]) => `${key}=${value}`)
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
    const failures = [];
    for (const base of pluralBases) {
      const ownForms = [...translated].filter(([key]) => key === base || key.startsWith(`${base}_`)).map(([, value]) => value);
      for (const count of [0, 1, 2, 5, 11, 21, 100, 1000000]) {
        const rendered = instance.t(base, { count });
        const expected = ownForms.map((form) => form.replace(/{{\s*count\s*}}/g, String(count)));
        if (!expected.includes(rendered)) failures.push(`${base} count=${count}: ${rendered}`);
        if (!rendered.includes(String(count))) failures.push(`${base} count=${count} lost the number: ${rendered}`);
      }
    }
    assert.deepEqual(failures, []);
  });
}

test('language option labels exist for every supported language', () => {
  const endonyms = supportedLanguages.map((language) => resources[language].translation.selectLanguage.options[language]);
  assert.equal(new Set(endonyms).size, supportedLanguages.length, 'each language has a distinct own name');
  for (const language of supportedLanguages) {
    const options = resources[language].translation.selectLanguage.options;
    assert.deepEqual(Object.keys(options).sort(), [...supportedLanguages].sort(), language);
    assert.equal(options.ja, '日本語', language);
  }
});
