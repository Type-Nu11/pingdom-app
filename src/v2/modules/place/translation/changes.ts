import type { TranslationLanguage } from './languages';

type TranslationChange = { kind: 'models' } | { kind: 'language'; storageKey: string; target: TranslationLanguage };
const listeners = new Set<(change: TranslationChange) => void>();

/** Keep mounted place and product text in sync; AsyncStorage remains the preference source. */
export function subscribeTranslationChanges(listener: (change: TranslationChange) => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function notifyTranslationChange(change: TranslationChange) {
  listeners.forEach(listener => listener(change));
}
