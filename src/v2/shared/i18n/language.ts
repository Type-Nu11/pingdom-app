import { supportedLanguages, type SupportedLanguage } from './resources';

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export interface LanguageStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === 'string'
    && supportedLanguages.includes(value as SupportedLanguage);
}

export function normalizeSupportedLanguage(value: unknown): SupportedLanguage | null {
  if (typeof value !== 'string') return null;

  const normalized = value.trim().toLowerCase().replace('_', '-');
  if (normalized === 'korean' || normalized === '한국어' || normalized.split('-')[0] === 'ko') return 'ko';
  if (normalized === 'english' || normalized === '영어' || normalized.split('-')[0] === 'en') return 'en';
  return null;
}

export function detectDeviceLanguage(): SupportedLanguage | null {
  try {
    return normalizeSupportedLanguage(Intl.DateTimeFormat().resolvedOptions().locale);
  } catch {
    return null;
  }
}

export function resolvePreferredLanguage({
  deviceLanguage,
  profileLanguage,
  storedLanguage,
}: {
  deviceLanguage?: unknown;
  profileLanguage?: unknown;
  storedLanguage?: unknown;
}): SupportedLanguage {
  return normalizeSupportedLanguage(storedLanguage)
    ?? normalizeSupportedLanguage(profileLanguage)
    ?? normalizeSupportedLanguage(deviceLanguage)
    ?? DEFAULT_LANGUAGE;
}

export async function restorePreferredLanguage({
  deviceLanguage,
  profileLanguage,
  storage,
  storageKey,
}: {
  deviceLanguage?: unknown;
  profileLanguage?: unknown;
  storage: LanguageStorage;
  storageKey: string;
}): Promise<{ hasStoredPreference: boolean; language: SupportedLanguage }> {
  let storedLanguage: string | null = null;
  try {
    storedLanguage = await storage.getItem(storageKey);
  } catch {
    // Storage availability must never prevent app startup.
  }
  const normalizedStoredLanguage = normalizeSupportedLanguage(storedLanguage);
  return {
    hasStoredPreference: normalizedStoredLanguage !== null,
    language: resolvePreferredLanguage({
      deviceLanguage,
      profileLanguage,
      storedLanguage: normalizedStoredLanguage,
    }),
  };
}

export async function applyLanguagePreference({
  changeLanguage,
  language,
  persist,
}: {
  changeLanguage: (language: SupportedLanguage) => Promise<unknown>;
  language: SupportedLanguage;
  persist: (language: SupportedLanguage) => Promise<unknown>;
}): Promise<boolean> {
  await changeLanguage(language);
  try {
    await persist(language);
    return true;
  } catch {
    return false;
  }
}
