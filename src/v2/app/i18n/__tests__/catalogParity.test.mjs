import assert from 'node:assert/strict';
import test from 'node:test';

import { resources } from '../resources.ts';
import { supportedLanguages } from '../../../shared/i18n/resources.ts';

// Every non-default language must mirror the default catalog so a missing key is caught here
// instead of being hidden by the English fallback at runtime.
const REFERENCE_LANGUAGE = 'en';
const JAPANESE_SCRIPT = /[぀-ヿ㐀-鿿]/u;
const HANGUL = /[ᄀ-ᇿ㄰-㆏가-힯]/u;

// Values intentionally kept in their original form in Japanese: brand names, units,
// formatting-only placeholders and fixed display labels.
const JAPANESE_UNTRANSLATED_ALLOWLIST = new Set([
  'community.author',
  'map.decision.livePicks',
  'map.recommendations.context.purpose.kPop',
  'map.search.confirm',
  'visitVerification.distanceKm',
  'voiceAssistant.brand',
  'voiceAssistant.shortLabel',
]);

const flatten = (value, prefix = '') => Object.entries(value).flatMap(([key, child]) => {
  const path = prefix ? `${prefix}.${key}` : key;
  return child && typeof child === 'object' ? flatten(child, path) : [[path, String(child)]];
});

const catalog = (language) => new Map(flatten(resources[language].translation));
const variables = (value) => [...value.matchAll(/{{\s*([^}]+?)\s*}}/g)].map((match) => match[1]).sort();
const tags = (value) => [...value.matchAll(/<\/?([a-z]+)>/g)].map((match) => match[0]).sort();
const withoutMarkup = (value) => value.replace(/{{[^}]*}}/g, '').replace(/<\/?[a-z]+>/g, '');

const reference = catalog(REFERENCE_LANGUAGE);
const korean = catalog('ko');
const otherLanguages = supportedLanguages.filter((language) => language !== REFERENCE_LANGUAGE);

test('every supported language has an assembled catalog', () => {
  assert.deepEqual(Object.keys(resources).sort(), [...supportedLanguages].sort());
});

for (const language of otherLanguages) {
  test(`${language} catalog has exactly the ${REFERENCE_LANGUAGE} key set`, () => {
    const translated = catalog(language);
    assert.deepEqual([...reference.keys()].filter((key) => !translated.has(key)), [], 'missing keys');
    assert.deepEqual([...translated.keys()].filter((key) => !reference.has(key)), [], 'unexpected keys');
  });

  test(`${language} catalog has no empty values`, () => {
    const empty = [...catalog(language)].filter(([, value]) => !value.trim()).map(([key]) => key);
    assert.deepEqual(empty, []);
  });

  test(`${language} interpolation variables and markup tags match the source copy`, () => {
    const mismatches = [];
    for (const [key, value] of catalog(language)) {
      const source = reference.get(key);
      // Korean may legitimately interpolate a different unit than English (e.g. distance copy),
      // so a translation must match at least one of the existing source catalogs.
      const sources = [source, korean.get(key)];
      if (!sources.some((candidate) => variables(candidate).join() === variables(value).join())) {
        mismatches.push(`${key}: {{${variables(value)}}} vs {{${variables(source)}}}`);
      }
      if (tags(source).join() !== tags(value).join()) mismatches.push(`${key}: tags ${tags(value)} vs ${tags(source)}`);
    }
    assert.deepEqual(mismatches, []);
  });
}

test('Japanese copy is translated and contains no Korean', () => {
  const japanese = catalog('ja');
  const hangul = [...japanese].filter(([, value]) => HANGUL.test(value)).map(([key]) => key);
  assert.deepEqual(hangul, []);

  const untranslated = [...japanese]
    .filter(([key, value]) => !JAPANESE_UNTRANSLATED_ALLOWLIST.has(key)
      && /[A-Za-z]{2}/.test(withoutMarkup(value))
      && !JAPANESE_SCRIPT.test(value))
    .map(([key, value]) => `${key}=${value}`);
  assert.deepEqual(untranslated, []);
});

test('the untranslated allowlist only names existing keys', () => {
  const japanese = catalog('ja');
  assert.deepEqual([...JAPANESE_UNTRANSLATED_ALLOWLIST].filter((key) => !japanese.has(key)), []);
});

test('language option labels exist for every supported language', () => {
  for (const language of supportedLanguages) {
    const options = resources[language].translation.selectLanguage.options;
    assert.deepEqual(Object.keys(options).sort(), [...supportedLanguages].sort(), language);
    assert.equal(options.ja, '日本語', language);
  }
});
