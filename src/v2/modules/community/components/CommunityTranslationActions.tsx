import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components/native';
import { Text } from '../../../shared/components/Typography';
import { TranslationAttributionBadge } from '../../../shared/translation/TranslationAttributionBadge';
import type { useCommunityTranslation } from '../hooks/useCommunityTranslation';
import AppModal from '../../../shared/components/AppModal';
import Button from '../../../shared/components/Button';

export default function CommunityTranslationActions({ translation }: { translation: ReturnType<typeof useCommunityTranslation> }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  if (!translation.hasText) return null;
  const { phase, busy } = translation;
  const label = phase === 'translated' ? 'original' : phase === 'needsDownload' ? 'download'
    : phase === 'checking' ? 'working' : phase === 'downloading' ? 'downloading' : phase === 'failed' ? 'retry' : 'translate';
  const message = phase === 'needsDownload' ? 'downloadHint' : phase === 'failed' || phase === 'unavailable' || phase === 'sameLanguage' ? phase : null;
  return <>
    {phase === 'translated' ? <View style={{ paddingVertical: 4 }}><TranslationAttributionBadge /></View> : null}
    <AppModal visible={translation.open} onClose={translation.onClose} dismissLabel={t('community.translation.close')}>
      <Text accessibilityRole="header" style={{ fontSize: 20, fontWeight: '700', color: colors.textStrong }}>{t('community.translation.title')}</Text>
      {message ? <Text accessibilityLiveRegion="polite" style={{ fontSize: 14, color: colors.textMuted }}>{t(`community.translation.${message}`)}</Text> : null}
      {phase !== 'sameLanguage' && <Button label={t(`community.translation.${label}`)} disabled={busy}
        onPress={translation.onPress} fullWidth variant="secondary" />}
      {busy ? <ActivityIndicator size="small" color={colors.primary} /> : phase === 'translated' ? <TranslationAttributionBadge /> : null}
      <Button label={t('community.translation.close')} onPress={translation.onClose} fullWidth variant="ghost" />
    </AppModal>
  </>;
}
