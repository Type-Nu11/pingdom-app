import React from 'react';
import { KeyboardAvoidingView, Linking, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';
import { Text, TextInput } from '../../../shared/components/Typography';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { retainInputLocally, unavailableSpeechAdapter, validateVoiceInput, type OnFinalInput, type SpeechInputAdapter } from '../model/voiceInput';

export type VoiceAssistantScreenProps = {
  onClose: () => void;
  adapter?: SpeechInputAdapter;
  // Only informational text; never maps to success UI, execution or TTS.
  guidance?: { kind: 'assistant' | 'clarification' | 'invalidResponse'; text?: string };
} & (
  | { onFinalInput?: undefined; submissionNotice?: never }
  | { onFinalInput: OnFinalInput; submissionNotice: string }
);
export default function VoiceAssistantScreen({ onClose, adapter = unavailableSpeechAdapter, onFinalInput = retainInputLocally, submissionNotice, guidance }: VoiceAssistantScreenProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { controller, state } = useVoiceInput(adapter, onFinalInput);
  const busy = ['permissionRequesting', 'listening', 'processing'].includes(state.phase);
  const pending = state.delivery === 'pending';
  const button = (key: 'close' | 'microphone' | 'stop' | 'cancel' | 'submit' | 'settings', onPress: () => void, disabled = false) => (
    <Action accessibilityRole="button" accessibilityLabel={t(`voiceAssistant.${key}`)} accessibilityState={{ disabled, busy: key === 'submit' ? pending : key === 'microphone' && busy }} disabled={disabled} onPress={onPress}>
      <Label>{t(`voiceAssistant.${key}`)}</Label>
    </Action>
  );
  return (
    <Screen testID="voice-assistant-screen" edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Content keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, gap: 16 }}>
          {button('close', () => { controller.cancel(); onClose(); })}
          <Title accessibilityRole="header">{t('voiceAssistant.title')}</Title>
          <Copy>{submissionNotice ?? t('voiceAssistant.preview')}</Copy>
          <Copy accessibilityLiveRegion="polite" accessibilityState={{ busy }}>{t(`voiceAssistant.phases.${state.phase}`)}</Copy>
          <Copy>{t(`voiceAssistant.permissions.${state.permission}`)}</Copy>
          {!adapter.available && <Copy>{t('voiceAssistant.voiceUnavailable')}</Copy>}
          {button('microphone', () => { void controller.start(i18n.resolvedLanguage === 'ko' ? 'ko-KR' : 'en-US'); }, busy || pending || !adapter.available)}
          {state.phase === 'listening' && button('stop', () => { void controller.stop(); })}
          {state.permission === 'blocked' && button('settings', () => { controller.cancel(); void Linking.openSettings().catch(() => undefined); })}
          {state.partial ? <Copy testID="voice-partial">{state.partial}</Copy> : null}
          <Copy>{t('voiceAssistant.review')}</Copy>
          <Input accessibilityLabel={t('voiceAssistant.input')} accessibilityState={{ disabled: pending }} editable={!pending} multiline
            placeholder={t('voiceAssistant.placeholder')} placeholderTextColor={theme.colors.textMuted}
            value={state.draft} onChangeText={controller.edit} textAlignVertical="top" autoCorrect={false} spellCheck={false} autoComplete="off" />
          {state.error && <Copy accessibilityRole="alert">{t(`voiceAssistant.errors.${state.error}`)}</Copy>}
          {button('submit', () => { void controller.submit(); }, busy || pending || validateVoiceInput(state.draft).error !== null || state.delivery !== 'none')}
          {button('cancel', controller.cancel)}
          {(state.delivery === 'localOnly' || state.delivery === 'accepted') && <Copy accessibilityLiveRegion="polite">{t(`voiceAssistant.${state.delivery}`)}</Copy>}
          <Copy>{t('voiceAssistant.advisory')}</Copy>
          {guidance && <>
            {guidance.kind !== 'assistant' && <Label>{t(`voiceAssistant.${guidance.kind}`)}</Label>}
            {guidance.kind !== 'invalidResponse' && guidance.text && <Copy>{guidance.text}</Copy>}
          </>}
        </Content>
      </KeyboardAvoidingView>
    </Screen>
  );
}
const Screen = styled(SafeAreaView)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
const Content = styled.ScrollView`flex: 1;`;
const Title = styled(Text)`
  font-family: ${({ theme }) => theme.typography.title.fontFamily};
  font-size: ${({ theme }) => theme.typography.title.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.title.fontWeight};
  line-height: ${({ theme }) => theme.typography.title.lineHeight}px;
  color: ${({ theme }) => theme.colors.textStrong};
`;
const Copy = styled(Text)`
  font-family: ${({ theme }) => theme.typography.body.fontFamily};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
  color: ${({ theme }) => theme.colors.text};
`;
const Label = styled(Text)`
  font-family: ${({ theme }) => theme.typography.label.fontFamily};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  line-height: ${({ theme }) => theme.typography.label.lineHeight}px;
  color: ${({ theme }) => theme.colors.textStrong};
`;
const Input = styled(TextInput)`
  font-family: ${({ theme }) => theme.typography.body.fontFamily};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-color: ${({ theme }) => theme.colors.borderEmphasis};
  border-width: 1px;
  border-radius: 12px;
  padding: 16px;
  min-height: 120px;
`;
const Action = styled.Pressable`
  min-height: 48px;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: ${({ theme, disabled }) => disabled ? theme.colors.disabled : theme.colors.surfaceElevated};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.borderEmphasis};
`;
