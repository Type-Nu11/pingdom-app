import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components/native';
import { Text } from '../components/Typography';
import { TranslationAttributionBadge } from './TranslationAttributionBadge';
import type { useContentTranslation } from './useContentTranslation';
import { contentTranslationResources } from './copy';
import { normalizeSupportedLanguage } from '../i18n/language';
import AppModal from '../components/AppModal';
import Button from '../components/Button';
import { useGroupedTranslationAttribution } from './TranslationAttributionGroup';

export default function ContentTranslationActions({ translation }: { translation: ReturnType<typeof useContentTranslation> }) {
  const { i18n } = useTranslation();
  const copy = contentTranslationResources[normalizeSupportedLanguage(i18n.resolvedLanguage ?? i18n.language) ?? 'en'];
  const { colors } = useTheme();
  const grouped = useGroupedTranslationAttribution(translation.hasText && translation.phase === 'translated');
  if (!translation.hasText) return null;
  const { phase, busy } = translation;
  const label = phase === 'translated' ? 'original' : phase === 'needsDownload' ? 'download'
    : phase === 'checking' ? 'working' : phase === 'downloading' ? 'downloading' : phase === 'failed' ? 'retry' : 'translate';
  const message = phase === 'needsDownload' ? 'downloadHint' : phase === 'failed' || phase === 'unavailable' || phase === 'sameLanguage' ? phase : null;
  return <>
    {!grouped && phase === 'translated' ? <View style={{ paddingVertical: 2 }}><TranslationAttributionBadge /></View> : null}
    <AppModal visible={translation.open} onClose={translation.onClose} dismissLabel={copy.close}>
      <Text accessibilityRole="header" style={{ fontSize: 20, fontWeight: '700', color: colors.textStrong }}>{copy.title}</Text>
      {message ? <Text accessibilityLiveRegion="polite" style={{ fontSize: 14, color: colors.textMuted }}>{copy[message]}</Text> : null}
      {phase !== 'sameLanguage' && <Button label={copy[label]} disabled={busy}
        onPress={translation.onPress} fullWidth variant="secondary" />}
      {busy ? <ActivityIndicator size="small" color={colors.primary} /> : null}
      <Button label={copy.close} onPress={translation.onClose} fullWidth variant="ghost" />
    </AppModal>
  </>;
}
