import { createTranslationService, nativeTranslation, type OfflineTranslationBridge } from '../../../shared/translation/service';
import type { TranslationLanguage } from './languages';

export type { OfflineTranslationBridge } from '../../../shared/translation/service';
const forKoreanPlaceText = (service: ReturnType<typeof createTranslationService>) => ({
  available: service.available,
  models: service.models,
  download: (target: TranslationLanguage) => service.downloadModels(target === 'ko' ? [] : ['ko', target]),
  delete: service.delete,
  translate: (text: string, target: TranslationLanguage) => service.translate(text, 'ko', target),
});
export function createOfflineTranslationService(bridge: () => OfflineTranslationBridge) {
  return forKoreanPlaceText(createTranslationService(bridge));
}
export const offlineTranslation = forKoreanPlaceText(nativeTranslation);
