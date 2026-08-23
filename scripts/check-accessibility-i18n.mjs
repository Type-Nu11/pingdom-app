import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');

const button = read('src/shared/components/Button.tsx');
const badge = read('src/shared/components/StatusBadge.tsx');
const translations = read('src/i18n/index.ts');
const targets = [
  read('src/features/place/components/MapBottomSheet.tsx'),
  read('src/features/place/screens/CheckInScreen.tsx'),
  read('src/features/place/screens/CouponWalletScreen.tsx'),
];

assert.match(button, /accessibilityRole="button"/);
assert.match(button, /busy: loading/);
assert.match(button, /minHeight: 52/);
assert.doesNotMatch(button, /numberOfLines=/);
assert.match(badge, /SYMBOLS/);
assert.match(badge, /accessibilityLabel=\{label\}/);

for (const locale of ['en', 'ko', 'ja', 'zh', 'vi', 'th']) {
  assert.match(translations, new RegExp(`\\n  ${locale}: \\{`));
}
assert.equal((translations.match(/experience: \{/g) ?? []).length, 6);
assert.equal((translations.match(/decision: \{/g) ?? []).length, 6);

for (const target of targets) {
  assert.doesNotMatch(target, /allowFontScaling=\{false\}/);
}

console.log('Accessibility and internationalization checks passed.');
