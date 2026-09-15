export const APPEARANCE_PREFERENCES = ['SYSTEM', 'LIGHT', 'DARK'] as const;
// Display mode is a device-level app preference, like language, and is not account-owned.
export const APPEARANCE_RESETS_ON_LOGOUT = false;

export type AppearancePreference = typeof APPEARANCE_PREFERENCES[number];
export type ResolvedColorScheme = 'light' | 'dark';

export function normalizeAppearancePreference(value: unknown): AppearancePreference {
  return typeof value === 'string'
    && APPEARANCE_PREFERENCES.includes(value as AppearancePreference)
    ? value as AppearancePreference
    : 'SYSTEM';
}

export function resolveColorScheme(
  preference: AppearancePreference,
  systemScheme: unknown,
): ResolvedColorScheme {
  if (preference === 'LIGHT') return 'light';
  if (preference === 'DARK') return 'dark';
  return systemScheme === 'dark' ? 'dark' : 'light';
}
