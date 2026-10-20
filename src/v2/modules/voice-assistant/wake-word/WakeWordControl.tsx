import { useAppDialog } from '../../../shared/components/AppDialogProvider';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';
import { SettingToggle } from '../../../shared/components';
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
  const enable = () => dialog.show(t('voiceAssistant.wakeWord.title'), t('voiceAssistant.wakeWord.notice'), [
    { text: t('voiceAssistant.wakeWord.cancel'), style: 'cancel' },
    { text: t('voiceAssistant.wakeWord.enable'), onPress: () => { void onEnable(); } },
  ]);
  // Same Figma Setting/ToggleRow and Setting/Toggle as the notification settings rows.
  return <Container>
    <Copy>
      <Title>{t('voiceAssistant.wakeWord.title')}</Title>
      <Description>{t('voiceAssistant.wakeWord.hint')}</Description>
      <Description accessibilityLiveRegion="polite">{t(`voiceAssistant.wakeWord.states.${state.phase}`)}</Description>
    </Copy>
    <SettingToggle disabled={!available && !state.enabled} value={state.enabled}
      accessibilityLabel={t('voiceAssistant.wakeWord.title')}
      accessibilityHint={t('voiceAssistant.wakeWord.hint')}
      onValueChange={value => { if (value) enable(); else void onDisable(); }} />
  </Container>;
}
const Container = styled.View`flex-direction: row; align-items: center; padding: 12px 0; gap: ${({ theme }) => theme.spacing.md}px;`;
const Copy = styled.View`flex: 1; gap: ${({ theme }) => theme.spacing.xs}px;`;
const Title = styled(Text)`
  color: ${({ theme }) => theme.colors.labelNormal};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.bodyMedium.fontWeight};
  line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight}px;
`;
const Description = styled(Text)`
  color: ${({ theme }) => theme.colors.labelAssistive};
  font-size: ${({ theme }) => theme.typography.captionRegular.fontSize}px;
  line-height: ${({ theme }) => theme.typography.captionRegular.lineHeight}px;
`;
