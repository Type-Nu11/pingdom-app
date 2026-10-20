import type { AppearancePreference } from './appearance';
import { normalizeAppearancePreference } from './appearance';

export const APPEARANCE_STORAGE_KEY = 'v2.appearance.preference';
export const APPEARANCE_HYDRATION_TIMEOUT_MS = 1_000;

export interface AppearanceStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export async function readAppearancePreference(
  storage: AppearanceStorage,
  timeoutMs = APPEARANCE_HYDRATION_TIMEOUT_MS,
): Promise<AppearancePreference> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const value = await Promise.race([
      storage.getItem(APPEARANCE_STORAGE_KEY),
      new Promise<null>((resolve) => { timeout = setTimeout(() => resolve(null), timeoutMs); }),
    ]);
    return normalizeAppearancePreference(value);
  } catch {
    return 'SYSTEM';
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function writeAppearancePreference(
  storage: AppearanceStorage,
  preference: AppearancePreference,
): Promise<void> {
  await storage.setItem(APPEARANCE_STORAGE_KEY, preference);
}
