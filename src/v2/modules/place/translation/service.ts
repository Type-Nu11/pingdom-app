import { NativeModules } from 'react-native';
import { missingModels, type TranslationLanguage } from './languages';
export type OfflineTranslationBridge = {
  getOfflineModels(): Promise<string[]>;
  downloadOfflineModel(language: string): Promise<void>;
  deleteOfflineModel(language: string): Promise<void>;
  translateOffline(text: string, target: string): Promise<string>;
};
// Memory cache is bounded and keyed by source language, exact original and target.
// Model availability always comes from native storage, never a persisted JS flag.
export function createOfflineTranslationService(bridge: () => OfflineTranslationBridge) {
  const cache = new Map<string, string>();
  const pending = new Map<string, Promise<string>>();
  let modelOperation: Promise<void> | null = null;
  const key = (text: string, target: string) => JSON.stringify(['ko', target, text]);
  const mutateModels = (operation: () => Promise<void>) => {
    if (modelOperation || pending.size) return Promise.reject(new Error('BUSY'));
    const task = operation().finally(() => { modelOperation = null; });
    modelOperation = task;
    return task;
  };
  return {
    available: () => Boolean(NativeModules.MLKitTranslation?.translateOffline),
    models: () => bridge().getOfflineModels(),
    download: (target: TranslationLanguage) => mutateModels(async () => {
      const missing = missingModels(await bridge().getOfflineModels(), target);
      for (const language of missing) await bridge().downloadOfflineModel(language);
    }),
    delete: (language: string) => mutateModels(async () => {
      await bridge().deleteOfflineModel(language);
      cache.clear();
    }),
    translate(text: string, target: TranslationLanguage): Promise<string> {
      if (target === 'ko') return Promise.resolve(text);
      const id = key(text, target);
      if (modelOperation) return Promise.reject(new Error('BUSY'));
      const active = pending.get(id);
      if (active) return active;
      const task = (async () => {
        if (missingModels(await bridge().getOfflineModels(), target).length) throw new Error('MODEL_DOWNLOAD_REQUIRED');
        const cached = cache.get(id);
        if (cached !== undefined) return cached;
        const result = await bridge().translateOffline(text, target);
        if (!result.trim()) throw new Error('EMPTY_TRANSLATION');
        cache.set(id, result);
        if (cache.size > 200) cache.delete(cache.keys().next().value!);
        return result;
      })().finally(() => { pending.delete(id); });
      pending.set(id, task);
      return task;
    },
  };
}
export const offlineTranslation = createOfflineTranslationService(() => {
  const bridge = NativeModules.MLKitTranslation as OfflineTranslationBridge | undefined;
  if (!bridge?.translateOffline) throw new Error('OFFLINE_TRANSLATION_UNAVAILABLE');
  return bridge;
});
