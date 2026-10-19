import { useAppDialog } from '../../../shared/components/AppDialogProvider';
import React from 'react';
import { Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';
import { Text } from '../../../shared/components/Typography';
import { useWakeWordSettings } from './WakeWordProvider';
import type { WakeWordSnapshot } from './wakeWord';

export function WakeWordSettingsControl() {
  const settings = useWakeWordSettings();
  return <WakeWordControl state={settings.state} available={settings.available}
    onEnable={settings.enable} onDisable={settings.disable} />;
}

export function WakeWordControl({ state, available = true, onEnable, onDisable }: {
  state: WakeWordSnapshot; available?: boolean; onEnable(): Promise<void>; onDisable(): Promise<void>;
}) {
  const { t } = useTranslation();
  const dialog = useAppDialog();
  const theme = useTheme();
  const enable = () => dialog.show(t('voiceAssistant.wakeWord.title'), t('voiceAssistant.wakeWord.notice'), [
    { text: t('voiceAssistant.wakeWord.cancel'), style: 'cancel' },
    { text: t('voiceAssistant.wakeWord.enable'), onPress: () => { void onEnable(); } },
  ]);
  return <Container>
    <Copy>
      <Title>{t('voiceAssistant.wakeWord.title')}</Title>
      <Description>{t('voiceAssistant.wakeWord.hint')}</Description>
      <Status accessibilityLiveRegion="polite">{t(`voiceAssistant.wakeWord.states.${state.phase}`)}</Status>
    </Copy>
    <Switch disabled={!available && !state.enabled} value={state.enabled}
      accessibilityState={{ checked: state.enabled, disabled: !available && !state.enabled }}
      trackColor={{ true: theme.colors.primary }}
      accessibilityLabel={t('voiceAssistant.wakeWord.title')}
      accessibilityHint={t('voiceAssistant.wakeWord.hint')}
      onValueChange={value => { if (value) enable(); else void onDisable(); }} />
  </Container>;
}
const Container = styled.View`flex-direction: row; align-items: center; padding: 10px 0; gap: 16px;`;
const Copy = styled.View`flex: 1; gap: 4px;`;
const Title = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-size: 15px;`;
const Description = styled(Text)`color: ${({ theme }) => theme.colors.textMuted}; font-size: 12px; line-height: 18px;`;
const Status = styled(Description)``;
