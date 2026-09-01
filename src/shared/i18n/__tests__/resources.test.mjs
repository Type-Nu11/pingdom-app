import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import test from 'node:test';
import { createInstance } from 'i18next';
import ts from 'typescript';

import { resources, supportedLanguages } from '../../../v2/shared/i18n/resources.ts';

const flattenKeys = (value, prefix = '') => Object.entries(value).flatMap(([key, child]) => {
  const path = prefix ? `${prefix}.${key}` : key;
  return child && typeof child === 'object' ? flattenKeys(child, path) : [path];
});

const flattenValues = (value) => Object.values(value).flatMap((child) =>
  child && typeof child === 'object' ? flattenValues(child) : [String(child)]);

const repositoryRoot = resolve(import.meta.dirname, '../../../..');
const sourceRoots = ['src/application', 'src/app', 'src/v2', 'src/features/auth', 'src/features/onboarding', 'src/features/place/screens'];
const ignoredPaths = ['/__tests__/', '/testing/', '/generated/', '/mock/', '/dev/'];

function sourceFiles(path) {
  const absolute = resolve(repositoryRoot, path);
  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const child = join(absolute, entry.name);
    if (ignoredPaths.some((ignored) => child.includes(ignored))) return [];
    if (entry.isDirectory()) return sourceFiles(child);
    return ['.ts', '.tsx'].includes(extname(child)) ? [child] : [];
  });
}

function staticTranslationKeys() {
  const keys = [];
  for (const file of sourceRoots.flatMap(sourceFiles)) {
    const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true,
      file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const visit = (node) => {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 't') {
        const argument = node.arguments[0];
        if (argument && ts.isStringLiteral(argument) && argument.text.includes('.')) keys.push(argument.text);
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  return [...new Set(keys)].sort();
}

test('canonical resources support only ko and en with exact key parity', () => {
  assert.deepEqual([...supportedLanguages], ['en', 'ko']);
  const en = flattenKeys(resources.en.translation).sort();
  const ko = flattenKeys(resources.ko.translation).sort();
  assert.deepEqual(ko, en);
  assert.ok(en.length > 400, `expected a production-sized resource catalog, received ${en.length}`);
  assert.equal(flattenValues(resources.en.translation).filter((value) => /[가-힣]/.test(value)).length, 0);
});

test('every static production translation call resolves in the canonical catalog', () => {
  const catalog = new Set(flattenKeys(resources.en.translation));
  const missing = staticTranslationKeys().filter((key) =>
    !catalog.has(key) && !(catalog.has(`${key}_one`) && catalog.has(`${key}_other`)));
  assert.deepEqual(missing, []);
});

test('fallback, interpolation, pluralization, and missing-key behavior are safe', async () => {
  const instance = createInstance();
  await instance.init({
    fallbackLng: 'en', lng: 'fr', resources, supportedLngs: [...supportedLanguages],
    interpolation: { escapeValue: false },
    parseMissingKeyHandler: () => resources.en.translation.common.missingTranslation,
  });
  assert.equal(instance.resolvedLanguage, 'en');
  assert.equal(instance.t('map.detail.preview', { name: 'Cafe' }), 'View Cafe details');
  assert.equal(instance.t('map.detail.reviewCount', { count: 2 }), '2 reviews');
  assert.equal(instance.t('missing.key'), 'Translation unavailable');
});
