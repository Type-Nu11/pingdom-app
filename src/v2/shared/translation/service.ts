import { NativeModules } from 'react-native';

export type TranslationPlan = {
  sourceLanguage: string;
  targetLanguage: string;
  shouldTranslate: boolean;
  missingModels: string[];
};
export type OfflineTranslationBridge = {
  getOfflineModels(): Promise<string[]>;
  downloadOfflineModel(language: string): Promise<void>;
  deleteOfflineModel(language: string): Promise<void>;
  translateOffline(text: string, target: string): Promise<string>;
  getTranslationPlan?(text: string, target: string): Promise<Omit<TranslationPlan, 'missingModels'>>;
  translate?(text: string, source: string, target: string, allowDownload: boolean): Promise<{ translatedText: string }>;
};
const requiredModels = (source: string, target: string) => source === target ? [] : [...new Set([source, target])].filter(code => code !== 'en');

/** One model-operation lock and bounded cache for place, product and user text. */
export function createTranslationService(bridge: () => OfflineTranslationBridge) {
  const cache = new Map<string, string>();
  const pending = new Map<string, Promise<string>>();
  let modelOperation: Promise<void> | null = null;
  const mutateModels = (operation: () => Promise<void>) => {
    if (modelOperation || pending.size) return Promise.reject(new Error('BUSY'));
    const task = operation().finally(() => { modelOperation = null; });
    modelOperation = task;
    return task;
  };
  const service = {
    available: () => Boolean(NativeModules.MLKitTranslation?.translateOffline),
    contentAvailable: () => Boolean(NativeModules.MLKitTranslation?.getTranslationPlan && NativeModules.MLKitTranslation?.translate),
    models: () => bridge().getOfflineModels(),
    downloadModels: (languages: readonly string[]) => mutateModels(async () => {
      const installed = await bridge().getOfflineModels();
      for (const code of new Set(languages)) {
        if (code !== 'en' && !installed.includes(code)) await bridge().downloadOfflineModel(code);
      }
    }),
    delete: (language: string) => mutateModels(async () => {
      await bridge().deleteOfflineModel(language);
      cache.clear();
    }),
    async prepare(text: string, target: string): Promise<TranslationPlan> {
      const plan = await bridge().getTranslationPlan?.(text, target);
      if (!plan) throw new Error('OFFLINE_TRANSLATION_UNAVAILABLE');
      const installed = plan.shouldTranslate ? await service.models() : [];
      return { ...plan, missingModels: requiredModels(plan.sourceLanguage, target).filter(code => !installed.includes(code)) };
    },
    translate(text: string, source: string, target: string): Promise<string> {
      if (source === target || !text.trim()) return Promise.resolve(text);
      const id = JSON.stringify([source, target, text]);
      if (modelOperation) return Promise.reject(new Error('BUSY'));
      const active = pending.get(id);
      if (active) return active;
      const task = (async () => {
        const installed = await service.models();
        if (requiredModels(source, target).some(code => !installed.includes(code))) throw new Error('MODEL_DOWNLOAD_REQUIRED');
        const cached = cache.get(id);
        if (cached !== undefined) return cached;
        const native = bridge();
        // Retain the deployed Korean-place bridge contract during migration.
        const result = source === 'ko' && target !== 'ko'
          ? await native.translateOffline(text, target)
          : (await native.translate?.(text, source, target, false))?.translatedText;
        if (!result?.trim()) throw new Error('EMPTY_TRANSLATION');
        cache.set(id, result);
        if (cache.size > 200) cache.delete(cache.keys().next().value!);
        return result;
      })().finally(() => { pending.delete(id); });
      pending.set(id, task);
      return task;
    },
  };
  return service;
}

export const nativeTranslation = createTranslationService(() => {
  const bridge = NativeModules.MLKitTranslation as OfflineTranslationBridge | undefined;
  if (!bridge) throw new Error('OFFLINE_TRANSLATION_UNAVAILABLE');
  return bridge;
});
