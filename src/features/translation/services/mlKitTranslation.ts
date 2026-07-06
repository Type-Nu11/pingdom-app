import { NativeModules } from 'react-native';
import type { TranslationPlan, TranslationResult } from '../model/translation.types';

type MLKitTranslationNativeModule = {
  getTranslationPlan: (text: string, targetLanguage: string) => Promise<TranslationPlan>;
  translate: (
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    allowModelDownload: boolean,
  ) => Promise<TranslationResult>;
};

const nativeModule = NativeModules.MLKitTranslation as MLKitTranslationNativeModule | undefined;

function getNativeModule() {
  if (!nativeModule) {
    throw new Error('ML_KIT_UNAVAILABLE');
  }

  return nativeModule;
}

export const mlKitTranslation = {
  getTranslationPlan: (text: string, targetLanguage: string) => (
    getNativeModule().getTranslationPlan(text, targetLanguage)
  ),
  translate: (
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    allowModelDownload: boolean,
  ) => getNativeModule().translate(
    text,
    sourceLanguage,
    targetLanguage,
    allowModelDownload,
  ),
};
