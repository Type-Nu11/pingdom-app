import { areServerInstantsEqual } from '../serverInstant';

test.each([
  ['2026-10-10T05:00:00Z', '2026-10-10T14:00:00+09:00'],
  ['2026-10-10T05:00:00Z', '2026-10-10T05:00:00.000Z'],
  ['2026-10-10T23:30:00Z', '2026-10-11T08:30:00+09:00'],
  ['2026-10-10T05:00:00Z', '2026-10-09T23:00:00-06:00'],
])('equivalent server instants compare equal: %s / %s', (a, b) => {
  expect(areServerInstantsEqual(a, b)).toBe(true);
});

test.each([
  ['2026-10-10T05:00:00Z', '2026-10-10T14:00:00.001+09:00'],
  ['2026-10-10T05:00:00Z', '2026-10-10T05:00:00+09:00'],
  ['2026-02-30T05:00:00Z', '2026-02-30T05:00:00Z'],
  ['2026-10-10T05:00:00', '2026-10-10T05:00:00'],
  ['invalid', 'invalid'], [null, null], [undefined, undefined],
])('changed or invalid server instants never compare equal: %s / %s', (a, b) => {
  expect(areServerInstantsEqual(a, b)).toBe(false);
});
