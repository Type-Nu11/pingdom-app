import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

import { resources } from '../resources.ts';
import { supportedLanguages } from '../../../shared/i18n/resources.ts';
import { REASON_CODES, reviewReasonLabelKey } from '../../../shared/api/reviewReasons.ts';

const lookup = (language, key) => key.split('.').reduce((node, part) => node?.[part], resources[language].translation);

// Figma 검증하기 > 추천 이유 (5772:11572)
const FIGMA_KO_LABELS = {
  kind: '친절해요',
  easyToFind: '찾기 쉬워요',
  delicious: '맛있어요',
  multilingual: '다국어 설명이 잘 되어 있어요',
  parking: '주차하기 편해요',
  photoSpot: '사진 찍기 좋아요',
  clean: '매장이 깨끗해요',
};

test('every review reason has a non-empty label in every supported language', () => {
  const missing = [];
  for (const language of supportedLanguages) {
    for (const reason of Object.keys(REASON_CODES)) {
      const label = lookup(language, reviewReasonLabelKey(reason));
      if (typeof label !== 'string' || !label.trim()) missing.push(`${language}:${reason}`);
    }
  }
  assert.deepEqual(missing, []);
});

test('reason labels stay distinct within each language', () => {
  for (const language of supportedLanguages) {
    const labels = Object.keys(REASON_CODES).map((reason) => lookup(language, reviewReasonLabelKey(reason)));
    assert.equal(new Set(labels).size, labels.length, language);
  }
});

test('ko reason labels match the Figma chips exactly and cover all server codes', () => {
  assert.deepEqual(Object.keys(REASON_CODES).sort(), Object.keys(FIGMA_KO_LABELS).sort());
  for (const [reason, label] of Object.entries(FIGMA_KO_LABELS)) {
    assert.equal(lookup('ko', reviewReasonLabelKey(reason)), label);
  }
});

test('the extra-reasons accessibility label exists in every supported language', () => {
  for (const language of supportedLanguages) {
    const label = lookup(language, 'visitVerification.reasonMoreCount');
    assert.match(String(label), /\{\{count\}\}/, language);
  }
});

// Provided source SVGs: viewBox width by reason (height is always 16).
const ICON_ASSETS = {
  kind: ['review-tag-kind.svg', 15],
  easyToFind: ['review-tag-easy-to-find.svg', 14],
  delicious: ['review-tag-delicious.svg', 16],
  multilingual: ['review-tag-multilingual.svg', 16],
  parking: ['review-tag-parking.svg', 16],
  photoSpot: ['review-tag-photo-spot.svg', 19],
  clean: ['review-tag-clean.svg', 16],
};

test('every review reason maps to a multi-colour source SVG that the icon component declares', () => {
  const root = resolve(import.meta.dirname, '../../../../..');
  const component = readFileSync(resolve(root, 'src/v2/shared/components/ReviewReasonIcon.tsx'), 'utf8');
  assert.deepEqual(Object.keys(ICON_ASSETS).sort(), Object.keys(REASON_CODES).sort());
  for (const [reason, [file, width]] of Object.entries(ICON_ASSETS)) {
    const svg = readFileSync(resolve(root, 'src/assets/v2/icons/review-tag', file), 'utf8');
    assert.ok(svg.includes(`viewBox="0 0 ${width} 16"`), `${file} viewBox`);
    assert.ok(/fill="#[0-9A-Fa-f]{6}"/.test(svg), `${file} keeps its source colours`);
    assert.ok(!svg.includes('currentColor'), `${file} must not use currentColor`);
    assert.ok(component.includes(`${reason}: { Icon: `) && component.includes(`${file}'`), `${reason} import`);
    assert.match(component, new RegExp(`${reason}: \\{ Icon: \\w+, viewBoxWidth: ${width} \\}`), `${reason} viewBoxWidth`);
  }
});
