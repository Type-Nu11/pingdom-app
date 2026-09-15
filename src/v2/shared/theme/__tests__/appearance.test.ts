import {
  APPEARANCE_RESETS_ON_LOGOUT,
  APPEARANCE_PREFERENCES,
  normalizeAppearancePreference,
  resolveColorScheme,
} from '../appearance';

describe('appearance policy', () => {
  test('keeps the device appearance preference across logout', () => {
    expect(APPEARANCE_RESETS_ON_LOGOUT).toBe(false);
  });
  test.each([
    ['SYSTEM', 'light', 'light'],
    ['SYSTEM', 'dark', 'dark'],
    ['LIGHT', 'dark', 'light'],
    ['DARK', 'light', 'dark'],
    ['SYSTEM', null, 'light'],
    ['SYSTEM', 'unexpected', 'light'],
  ] as const)('%s + system %s resolves to %s', (preference, systemScheme, expected) => {
    expect(resolveColorScheme(preference, systemScheme)).toBe(expected);
  });

  test.each(APPEARANCE_PREFERENCES)('accepts stored %s', (preference) => {
    expect(normalizeAppearancePreference(preference)).toBe(preference);
  });

  test.each([undefined, null, '', 'dark', 'AUTO', 1, {}])(
    'recovers invalid stored value %p to SYSTEM',
    (value) => {
      expect(normalizeAppearancePreference(value)).toBe('SYSTEM');
    },
  );
});
