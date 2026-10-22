import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AccessibilityActionEvent } from 'react-native';
import { normalizeSupportedLanguage } from '../../../shared/i18n/language';
import { nativeTranslation } from '../../../shared/translation/service';

type Phase = 'original' | 'checking' | 'downloading' | 'translated' | 'needsDownload' | 'sameLanguage' | 'failed' | 'unavailable';
type State = { key: string; phase: Phase; translatedTexts?: string[] };

export function useCommunityTranslation(id: string, originals: readonly string[]) {
  const { i18n, t } = useTranslation();
  const language = normalizeSupportedLanguage(i18n.resolvedLanguage ?? i18n.language) ?? 'en';
  const target = language.startsWith('zh-') ? 'zh' : language === 'pt-BR' ? 'pt' : language;
  const key = JSON.stringify([id, target, originals]);
  const latestKey = useRef(key);
  latestKey.current = key;
  const generation = useRef(0);
  const lock = useRef<{ key: string; token: number } | null>(null);
  const [stored, setStored] = useState<State>({ key, phase: 'original' });
  const [dialogKey, setDialogKey] = useState<string | null>(null);
  const state = stored.key === key ? stored : { key, phase: 'original' as const };
  useEffect(() => () => { ++generation.current; }, [key]);

  const run = async (download: boolean) => {
    if (lock.current?.key === key) return;
    const token = ++generation.current;
    const valid = () => latestKey.current === key && generation.current === token;
    lock.current = { key, token };
    setStored({ key, phase: 'checking' });
    try {
      if (!nativeTranslation.contentAvailable()) { setStored({ key, phase: 'unavailable' }); return; }
      const plan = await nativeTranslation.prepare(originals.filter(text => text.trim()).join('\n\n'), target);
      if (!valid()) return;
      if (!plan.shouldTranslate) { setStored({ key, phase: 'sameLanguage' }); return; }
      if (plan.missingModels.length) {
        if (!download) { setStored({ key, phase: 'needsDownload' }); return; }
        setStored({ key, phase: 'downloading' });
        await nativeTranslation.downloadModels(plan.missingModels);
        if (!valid()) return;
        setStored({ key, phase: 'checking' });
      }
      const translatedTexts = await Promise.all(originals.map(text => nativeTranslation.translate(text, plan.sourceLanguage, target)));
      if (valid()) { setStored({ key, phase: 'translated', translatedTexts }); setDialogKey(null); }
    } catch {
      if (valid()) setStored({ key, phase: 'failed' });
    } finally {
      if (lock.current?.token === token) lock.current = null;
    }
  };
  return {
    phase: state.phase,
    busy: state.phase === 'checking' || state.phase === 'downloading',
    hasText: originals.some(text => text.trim()),
    open: dialogKey === key,
    onClose: () => setDialogKey(null),
    textActions: {
      onLongPress: () => setDialogKey(key),
      accessibilityHint: t('community.translation.hint'),
      accessibilityActions: [{ name: 'longpress' as const, label: t('community.translation.title') }],
      onAccessibilityAction: (event: AccessibilityActionEvent) => {
        if (event.nativeEvent.actionName === 'longpress') setDialogKey(key);
      },
    },
    texts: state.phase === 'translated' && state.translatedTexts ? state.translatedTexts : originals,
    onPress: () => {
      if (state.phase === 'translated') { setStored({ ...state, phase: 'original' }); setDialogKey(null); }
      else if (state.translatedTexts) { setStored({ ...state, phase: 'translated' }); setDialogKey(null); }
      else void run(state.phase === 'needsDownload');
    },
  };
}
