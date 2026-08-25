import AsyncStorage from '@react-native-async-storage/async-storage';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import {
  resources,
  supportedLanguages,
  type SupportedLanguage,
} from './resources';

export const LANGUAGE_STORAGE_KEY = 'language';
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export const i18n = createInstance();

let initializationPromise: Promise<void> | null = null;

export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === 'string'
    && supportedLanguages.includes(value as SupportedLanguage);
}

async function readStoredLanguage(): Promise<SupportedLanguage> {
  try {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isSupportedLanguage(storedLanguage) ? storedLanguage : DEFAULT_LANGUAGE;
  } catch (error) {
    console.warn('[V2 i18n] Failed to restore language:', error);
    return DEFAULT_LANGUAGE;
  }
}

export function initializeI18n(): Promise<void> {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      const language = await readStoredLanguage();

      await i18n.use(initReactI18next).init({
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false,
        },
        lng: language,
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

  await i18n.changeLanguage(language);

  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.warn('[V2 i18n] Failed to persist language:', error);
  }
}

export type { SupportedLanguage } from './resources';
