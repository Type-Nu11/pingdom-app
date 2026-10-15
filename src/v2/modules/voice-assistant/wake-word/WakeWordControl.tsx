import React from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';
import { Text } from '../../../shared/components/Typography';
import type { WakeWordSnapshot } from './wakeWord';

export function WakeWordControl({ state, onEnable, onDisable }: { state: WakeWordSnapshot; onEnable(): Promise<void>; onDisable(): Promise<void> }) {
  const { t } = useTranslation();
  const enable = () => Alert.alert(t('voiceAssistant.wakeWord.title'), t('voiceAssistant.wakeWord.notice'), [
    { text: t('voiceAssistant.wakeWord.cancel'), style: 'cancel' },
    { text: t('voiceAssistant.wakeWord.enable'), onPress: () => { void onEnable(); } },
  ]);
  return <Container accessibilityLiveRegion="polite">
    <Status>{t(`voiceAssistant.wakeWord.states.${state.phase}`)}</Status>
    <Toggle accessibilityRole="switch" accessibilityState={{ checked: state.enabled }}
      accessibilityLabel={t(state.enabled ? 'voiceAssistant.wakeWord.stop' : 'voiceAssistant.wakeWord.enable')}
      accessibilityHint={t('voiceAssistant.wakeWord.hint')}
      onPress={state.enabled ? () => { void onDisable(); } : enable}>
      <Label>{t(state.enabled ? 'voiceAssistant.wakeWord.stop' : 'voiceAssistant.wakeWord.enable')}</Label>
    </Toggle>
  </Container>;
}
const Container = styled.View`flex-direction: row; align-items: center; padding: 8px; border-radius: 16px; background-color: ${({ theme }) => theme.colors.background};`;
const Status = styled(Text)`flex: 1; color: ${({ theme }) => theme.colors.text}; font-size: 12px;`;
const Toggle = styled.Pressable`min-height: 44px; min-width: 44px; justify-content: center; padding: 8px;`;
const Label = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-size: 12px;`;
