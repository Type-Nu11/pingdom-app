import { TranslationAttributionBadge, type TranslationDisplayState } from './TranslationAttribution';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View, useWindowDimensions, type StyleProp, type TextStyle } from 'react-native';
import AppModal from '../../../shared/components/AppModal';
import Button from '../../../shared/components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components/native';
import { Text } from '../../../shared/components/Typography';
import { useProfile } from '../../user/profile';
import { isTranslationLanguage, missingModels, recommendedTranslationLanguage, translationLanguages, type TranslationLanguage } from './languages';
import { offlineTranslation } from './service';
import { getTranslationCopy, getTranslationManageHint } from './copy';

type Phase = 'idle' | 'checking' | 'downloading' | 'ready' | 'translating' | 'failed';
type Props = {
  original: string;
  nameStyle?: StyleProp<TextStyle>;
  onNamePress?: () => void;
  category?: React.ReactNode;
  inlineCategory?: boolean;
  attributionPlacement?: 'title' | 'photos';
  onTranslationChange?: (state: TranslationDisplayState) => void;
};
export default function PlaceNameTranslation({ original, nameStyle, onNamePress, category, inlineCategory = false, attributionPlacement = 'title', onTranslationChange }: Props) {
  const { profile } = useProfile();
  const { i18n } = useTranslation();
  const { colors, typography } = useTheme();
  const { fontScale } = useWindowDimensions();
  const copy = getTranslationCopy(i18n.language);
  const [target, setTarget] = useState<TranslationLanguage | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [models, setModels] = useState<string[]>([]);
  const [result, setResult] = useState<{ original: string; target: TranslationLanguage; text: string } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [open, setOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const generation = useRef(0);
  const locked = useRef(false);
  const storageKey = `@pingdom/place-translation/target/${profile?.id ?? 'guest'}`;
  const busy = phase === 'checking' || phase === 'downloading' || phase === 'translating';
  const missing = target ? missingModels(models, target) : [];
  const modelName = (code: string) => code === 'ko' ? '한국어' : translationLanguages.find((item) => item.code === code)?.name ?? code;
  const validResult = result?.original === original && result?.target === target ? result : null;
  const isTranslated = Boolean(showResult && validResult);
  useLayoutEffect(() => { onTranslationChange?.({ original, translated: isTranslated }); }, [original, isTranslated, onTranslationChange]);

  useEffect(() => {
    let active = true;
    setHydrated(false);
    setTarget(null);
    void AsyncStorage.getItem(storageKey).then((stored) => {
      if (active) setTarget(isTranslationLanguage(stored) ? stored : recommendedTranslationLanguage(profile?.country));
    }).catch(() => { if (active) setTarget(recommendedTranslationLanguage(profile?.country)); })
      .finally(() => { if (active) setHydrated(true); });
    return () => { active = false; };
  }, [storageKey, profile?.country]);

  useEffect(() => {
    const token = ++generation.current;
    locked.current = false;
    setResult(null); setShowResult(false); setPhase('idle');
    if (hydrated && target && target !== 'ko' && original.trim() && offlineTranslation.available()) {
      setPhase('checking');
      locked.current = true;
      void (async () => {
        const installed = await offlineTranslation.models();
        if (token !== generation.current) return;
        setModels(installed);
        if (missingModels(installed, target).length) { setPhase('idle'); return; }
        setPhase('translating');
        const text = await offlineTranslation.translate(original, target);
        if (token !== generation.current) return;
        setResult({ original, target, text }); setShowResult(true); setPhase('ready');
      })().catch(() => { if (token === generation.current) setPhase('failed'); })
        .finally(() => { if (token === generation.current) locked.current = false; });
    }
    return () => { ++generation.current; };
  }, [original, target, hydrated, refresh]);

  const run = async (operation: 'download' | 'delete' | 'check', model?: string) => {
    if (!target || locked.current) return;
    locked.current = true;
    const token = generation.current;
    setPhase(operation === 'download' ? 'downloading' : 'checking');
    try {
      if (operation === 'download') await offlineTranslation.download(target);
      if (operation === 'delete') {
        if (!model) return;
        await offlineTranslation.delete(model);
      }
      const installed = await offlineTranslation.models();
      if (token !== generation.current) return;
      setModels(installed);
      setRefresh(value => value + 1);
    } catch {
      if (token === generation.current) { setShowResult(false); setPhase('failed'); }
    } finally {
      if (token === generation.current) locked.current = false;
    }
  };
  const select = async (value: TranslationLanguage) => {
    if (locked.current && value !== 'ko') return;
    setTarget(value);
    try { await AsyncStorage.setItem(storageKey, value); } catch { setPhase('failed'); }
  };
  const textStyle = { color: colors.textMuted, fontSize: 12 };
  const buttonStyle = { minHeight: 44, minWidth: 44, flexShrink: 1, justifyContent: 'center' as const, paddingHorizontal: 8 };
  const action = (label: string, onPress: () => void, disabled = busy, accessibilityLabel = label) => (
    <Button label={label} accessibilityLabel={accessibilityLabel} onPress={onPress} disabled={disabled}
      fullWidth shape="pill" size="medium" variant={label === copy.close ? 'ghost' : 'secondary'} />
  );
  if (!original.trim()) return null;
  return (
    <View testID="place-name-translation" style={{ minWidth: 0 }}>
      <View testID="place-name-translation-header" style={{ flexDirection: 'row', alignItems: 'center', minHeight: 62 * fontScale }}>
        <Text
          testID="place-name-translation-title"
          accessibilityLabel={showResult && validResult ? validResult.text : original}
          accessibilityHint={`${getTranslationManageHint(i18n.language)}${showResult && validResult ? ` ${copy.notice} ${original}` : ''}`}
          accessibilityActions={[{ name: 'longpress', label: copy.language }]}
          onAccessibilityAction={event => { if (event.nativeEvent.actionName === 'longpress') setOpen(true); }}
          onLongPress={() => setOpen(true)}
          accessibilityRole="button"
          ellipsizeMode="tail"
          numberOfLines={2}
          onPress={onNamePress ?? (() => setOpen(true))}
          style={[{ color: colors.textStrong, fontSize: 21, lineHeight: 27 }, nameStyle, { flex: 1, minWidth: 0 }]}
        >
          {showResult && validResult ? validResult.text : original}
          {inlineCategory && category ? <> {category}</> : null}
        </Text>
        {busy ? <ActivityIndicator accessibilityLabel={phase === 'downloading' ? copy.downloading : phase === 'translating' ? copy.translating : copy.checking} size="small" color={colors.primary} />
          : hydrated && offlineTranslation.available() && (!target || missing.length > 0 || phase === 'failed') ? (
            <Pressable accessibilityRole="button" accessibilityLabel={!target ? copy.choose : phase === 'failed' ? copy.retry : copy.needsDownload}
              onPress={() => { if (phase === 'failed' && target) void run('check'); else setOpen(true); }} style={buttonStyle}>
              <Text style={{ ...textStyle, color: colors.primary }}>{!target ? copy.choose : phase === 'failed' ? copy.retry : copy.needsDownload}</Text>
            </Pressable>
          ) : null}
      </View>
      {(attributionPlacement === 'title' || !inlineCategory || phase === 'failed') && <View style={{ height: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {phase === 'failed' ? <Text accessibilityLiveRegion="polite" style={textStyle}>{copy.failed}</Text> : !inlineCategory ? category ?? <View /> : <View />}
        {attributionPlacement === 'title' && isTranslated ? <TranslationAttributionBadge /> : null}
      </View>}
      <AppModal visible={open} onClose={() => setOpen(false)} dismissLabel={copy.close} testID="place-translation-dialog">
            <Text style={{ ...typography.title, color: colors.textStrong }} accessibilityRole="header">{copy.language}</Text>
            <Text style={textStyle}>{original}</Text>
            <Text style={textStyle}>{copy.notice}</Text>
            <ScrollView style={{ flexShrink: 1 }}>
              {translationLanguages.map((item) => <Pressable key={item.code} accessibilityRole="radio" accessibilityState={{ checked: target === item.code, disabled: busy && item.code !== 'ko' }} disabled={busy && item.code !== 'ko'} onPress={() => { void select(item.code); }} style={buttonStyle}>
                <Text style={{ color: target === item.code ? colors.primary : colors.textStrong }}>{target === item.code ? '✓ ' : ''}{item.name}</Text>
              </Pressable>)}
              {models.filter((code) => code !== 'en' && (code === 'ko' || translationLanguages.some((item) => item.code === code))).map((code) => (
                <View key={code} style={{ gap: 8, marginTop: 12 }}>
                  {code === 'ko' ? <Text style={textStyle}>{copy.shared}</Text> : null}
                  {action(`${copy.remove}: ${modelName(code)}`, () => { void run('delete', code); }, busy || !target)}
                </View>
              ))}
            </ScrollView>
            <Text accessibilityLiveRegion="polite" style={textStyle}>{target === 'ko' ? copy.originalMode : !offlineTranslation.available() ? copy.unavailable : phase === 'failed' ? copy.failed : phase === 'checking' ? copy.checking : phase === 'downloading' ? copy.downloading : missing.length ? `${copy.missing}: ${missing.map(modelName).join(', ')} · ${copy.estimate}: ≈${missing.length * 30} MB. ${copy.wifi}` : target ? copy.ready : copy.choose}</Text>
            {busy ? <ActivityIndicator accessibilityLabel={copy.downloading} color={colors.primary} /> : null}
            {target && missing.length > 0 ? action(copy.download, () => { void run('download'); }, busy || !offlineTranslation.available()) : null}
            {phase === 'failed' ? action(copy.retry, () => { void run('check'); }) : null}
            {action(copy.close, () => setOpen(false), false)}
      </AppModal>
    </View>
  );
}
