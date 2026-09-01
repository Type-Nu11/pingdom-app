import AsyncStorage from '@react-native-async-storage/async-storage';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import {
  resources,
  supportedLanguages,
  type SupportedLanguage,
} from './resources';
import {
  applyLanguagePreference,
  DEFAULT_LANGUAGE,
  detectDeviceLanguage,
  normalizeSupportedLanguage,
  restorePreferredLanguage,
} from './language';

export const LANGUAGE_STORAGE_KEY = 'language';
export { DEFAULT_LANGUAGE, detectDeviceLanguage, isSupportedLanguage, normalizeSupportedLanguage, resolvePreferredLanguage } from './language';

export const i18n = createInstance();

let initializationPromise: Promise<void> | null = null;
let hasExplicitLanguagePreference = false;

export function initializeI18n(profileLanguage?: unknown): Promise<void> {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      const restored = await restorePreferredLanguage({
        deviceLanguage: detectDeviceLanguage(),
        profileLanguage,
        storage: AsyncStorage,
        storageKey: LANGUAGE_STORAGE_KEY,
      });
      hasExplicitLanguagePreference = restored.hasStoredPreference;

      await i18n.use(initReactI18next).init({
        fallbackLng: DEFAULT_LANGUAGE,
        interpolation: {
          escapeValue: false,
        },
        lng: restored.language,
        parseMissingKeyHandler: () => resources[DEFAULT_LANGUAGE].translation.common.missingTranslation,
        returnEmptyString: false,
        returnNull: false,
        resources,
        supportedLngs: [...supportedLanguages],
      });
    })().catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }

  return initializationPromise;
}

export async function setLanguage(language: SupportedLanguage): Promise<void> {
  if (!i18n.isInitialized) {
    await initializeI18n();
  }

  hasExplicitLanguagePreference = true;
  const persisted = await applyLanguagePreference({
    changeLanguage: (nextLanguage) => i18n.changeLanguage(nextLanguage),
    language,
    persist: (nextLanguage) => AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage),
  });
  if (!persisted) {
    console.warn('[V2 i18n] Failed to persist language.');
  }
}

export async function syncProfileLanguage(profileLanguage: unknown): Promise<void> {
  if (hasExplicitLanguagePreference) return;

  const language = normalizeSupportedLanguage(profileLanguage);
  if (!language) return;
  if (!i18n.isInitialized) await initializeI18n(language);
  if (i18n.resolvedLanguage !== language) await i18n.changeLanguage(language);
}

export function resetI18nForTests(): void {
  initializationPromise = null;
  hasExplicitLanguagePreference = false;
}

export type { SupportedLanguage } from './resources';
