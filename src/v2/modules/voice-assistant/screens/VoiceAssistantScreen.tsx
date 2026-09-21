import React from 'react';
import { AppState, Linking } from 'react-native';
import { KeyboardAvoidingView, KeyboardProvider } from 'react-native-keyboard-controller';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';
import { Text, TextInput } from '../../../shared/components/Typography';
import { AssistantEdgeGlow } from '../components/AssistantEdgeGlow';
import AssistantIcon from '../assets/assistant.svg';
import CloseIcon from '../assets/close.svg';
import MicrophoneIcon from '../assets/microphone.svg';
import PingdyIcon from '../assets/pingdy.svg';
import StopIcon from '../assets/stop.svg';
import { VoiceCommandResults } from '../components/VoiceCommandResults';
import type { VoiceCommandViewState } from '../hooks/useVoiceCommands';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { retainInputLocally, unavailableSpeechAdapter, validateVoiceInput, type OnFinalInput, type SpeechInputAdapter } from '../model/voiceInput';

export type VoiceAssistantScreenProps = {
  onClose: () => void;
  adapter?: SpeechInputAdapter;
  commandState?: VoiceCommandViewState;
  onCommandCancel?: () => void;
  onCommandRetry?: () => void;
  commandRetryDisabled?: boolean;
  timezone?: string;
  // Only informational text; never maps to success UI, execution or TTS.
  guidance?: { kind: 'assistant' | 'clarification' | 'invalidResponse'; text?: string };
} & (
  | { onFinalInput?: undefined; submissionNotice?: never }
  | { onFinalInput: OnFinalInput; submissionNotice: string }
);
export default function VoiceAssistantScreen({ onClose, adapter = unavailableSpeechAdapter, onFinalInput = retainInputLocally, submissionNotice, guidance, commandState, onCommandCancel, onCommandRetry, commandRetryDisabled }: VoiceAssistantScreenProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { controller, state } = useVoiceInput(adapter, onFinalInput);
  const busy = ['permissionRequesting', 'listening', 'processing'].includes(state.phase);
  const pending = state.delivery === 'pending';
  const showDetails = (state.source === 'voice' && !!state.draft) || busy || !!state.error || !!guidance
    || state.delivery !== 'none' || (commandState && commandState.phase !== 'idle');
  const close = () => { controller.cancel(); onCommandCancel?.(); onClose(); };
  const start = () => {
    controller.setForeground(AppState.currentState === 'active');
    void controller.start(i18n.resolvedLanguage === 'ko' ? 'ko-KR' : 'en-US');
  };
  const submitDisabled = busy || pending || validateVoiceInput(state.draft).error !== null || state.delivery !== 'none';
  const button = (key: 'close' | 'microphone' | 'stop' | 'cancel' | 'submit' | 'settings', onPress: () => void, disabled = false) => (
    <Action accessibilityRole="button" accessibilityLabel={t(`voiceAssistant.${key}`)} accessibilityState={{ disabled, busy: key === 'submit' ? pending : key === 'microphone' && busy }} disabled={disabled} onPress={onPress}>
      <Label>{t(`voiceAssistant.${key}`)}</Label>
    </Action>
  );
  const composer = (embedded = false) => <Composer testID="voice-assistant-composer" $embedded={embedded}>
    <InputRow $embedded={embedded}>
      <AssistantIcon width={23} height={23} />
      <Input accessibilityLabel={t('voiceAssistant.input')}
        accessibilityState={{ disabled: pending }} editable={!pending}
        placeholder={t('voiceAssistant.placeholder')} placeholderTextColor={theme.colors.textMuted}
        value={state.draft} onChangeText={controller.edit} returnKeyType="send"
        onSubmitEditing={() => { if (!submitDisabled) void controller.submit(); }}
        autoCorrect={false} spellCheck={false} autoComplete="off" />
      {state.phase === 'listening' ? <RecordingButton accessibilityRole="button" accessibilityLabel={t('voiceAssistant.stop')}
        onPress={() => { void controller.stop(); }}>
        <StopIcon width={24} height={24} />
        <Waveform accessibilityElementsHidden>
          <WaveBar $height={8} /><WaveBar $height={14} /><WaveBar $height={18} $strong /><WaveBar $height={11} />
        </Waveform>
      </RecordingButton> : <MicrophoneButton accessibilityRole="button" accessibilityLabel={t('voiceAssistant.microphone')}
        accessibilityHint={!adapter.available ? t('voiceAssistant.voiceUnavailable') : undefined}
        accessibilityState={{ disabled: busy || pending || !adapter.available, busy }}
        disabled={busy || pending || !adapter.available} onPress={start}>
        <MicrophoneIcon width={24} height={24} />
      </MicrophoneButton>}
    </InputRow>
  </Composer>;
  return (
    <KeyboardProvider><Screen testID="voice-assistant-screen" accessibilityViewIsModal onAccessibilityEscape={close}>
      <Backdrop accessibilityRole="button"
        accessibilityLabel={t('voiceAssistant.close')} accessible={!showDetails} onPress={close} />
      <AssistantEdgeGlow />
      <SafeArea edges={['top', 'left', 'right']} pointerEvents="box-none">
        <KeyboardAvoidingView testID="voice-assistant-keyboard-layout" behavior="padding" style={{ flex: 1 }} pointerEvents="box-none">
        <KeyboardLayout pointerEvents="box-none" style={{ paddingBottom: Math.max(insets.bottom, 24) + 12 }}>
          {showDetails ? <Sheet testID="voice-assistant-details">
            <Grabber />
            <Header>
              <Title accessibilityRole="header"><PingdyIcon width={24} height={24} /><TitleText>{t('voiceAssistant.brand')}</TitleText></Title>
              <CloseButton accessibilityRole="button" accessibilityLabel={t('voiceAssistant.close')} onPress={close}>
                <CloseIcon width={19} height={19} />
              </CloseButton>
            </Header>
            <Content keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10, gap: 8 }}>
            {!!state.draft && <QueryText>“{state.draft}”</QueryText>}
            {busy && <Copy accessibilityLiveRegion="polite">{t(`voiceAssistant.phases.${state.phase}`)}</Copy>}
            {state.permission === 'blocked' && button('settings', () => { controller.cancel(); void Linking.openSettings().catch(() => undefined); })}
            {state.partial ? <Copy testID="voice-partial">{state.partial}</Copy> : null}
            {state.error && <Copy accessibilityRole="alert">{t(`voiceAssistant.errors.${state.error}`)}</Copy>}
            {(state.draft || busy || pending) && (!commandState || commandState.phase === 'idle') && <ReviewActions>
              {button('submit', () => { void controller.submit(); }, submitDisabled)}
              {button('cancel', () => { controller.cancel(); onCommandCancel?.(); })}
            </ReviewActions>}
            {commandState && <VoiceCommandResults state={commandState} retryDisabled={commandRetryDisabled} onShowMap={close} onRetry={() => {
              if (onCommandRetry) onCommandRetry();
              else { const draft = state.draft; controller.cancel(); controller.edit(draft); void controller.submit(); }
            }} />}
            {(state.delivery === 'localOnly' || state.delivery === 'accepted') && <Copy accessibilityLiveRegion="polite">{t(`voiceAssistant.${state.delivery}`)}</Copy>}
            {(guidance || state.delivery === 'accepted') && <Copy>{t('voiceAssistant.advisory')}</Copy>}
            {guidance && <>
              {guidance.kind !== 'assistant' && <Label>{t(`voiceAssistant.${guidance.kind}`)}</Label>}
              {guidance.kind !== 'invalidResponse' && guidance.text && <Copy>{guidance.text}</Copy>}
            </>}
            </Content>
            {composer(true)}
          </Sheet> : composer()}
        </KeyboardLayout>
        </KeyboardAvoidingView>
      </SafeArea>
    </Screen></KeyboardProvider>
  );
}
const Screen = styled.View`flex: 1; background-color: transparent;`;
const Backdrop = styled.Pressable`position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px; background-color: rgba(0, 0, 0, 0.5);`;
const SafeArea = styled(SafeAreaView)`flex: 1;`;
const KeyboardLayout = styled.View`flex: 1; width: 100%; max-width: 640px; align-self: center; justify-content: flex-end; padding-horizontal: 8px;`;
const MicrophoneButton = styled.Pressable`width: 44px; height: 44px; align-items: center; justify-content: center; margin-right: -10px;`;
const RecordingButton = styled.Pressable`height: 44px; flex-direction: row; align-items: center; gap: 10px; margin-right: -4px;`;
const Waveform = styled.View`height: 24px; flex-direction: row; align-items: center; gap: 3px;`;
const WaveBar = styled.View<{ $height: number; $strong?: boolean }>`
  width: 3px; height: ${({ $height }) => $height}px; border-radius: 2px;
  background-color: ${({ $strong }) => $strong ? '#ff1956' : '#ff4a75'};
`;
const Sheet = styled.View.attrs(({ theme }) => ({ style: { boxShadow: theme.liquidGlass.sheet.shadow } }))`
  width: 100%; max-width: 386px; max-height: 78%; align-self: center; padding-top: 6px; padding-bottom: 12px;
  gap: 8px; border-radius: 36px; overflow: hidden; background-color: ${({ theme }) => theme.liquidGlass.sheet.tint};
`;
const Grabber = styled.View`width: 56px; height: 5px; border-radius: 3px; align-self: center; background-color: #bfc1c1;`;
const Header = styled.View`height: 40px; padding-horizontal: 16px; flex-direction: row; align-items: center; justify-content: space-between;`;
const Title = styled.View`flex-direction: row; align-items: center; gap: 8px;`;
const TitleText = styled(Text)`color: ${({ theme }) => theme.colors.textStrong}; font-size: 24px; line-height: 31px; font-weight: 700;`;
const CloseButton = styled.Pressable.attrs({ style: { boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.06)' } })`
  width: 32px; height: 32px; border-radius: 16px; align-items: center; justify-content: center;
  background-color: rgba(255, 255, 255, 0.56);
`;
const Content = styled.ScrollView`
  flex-grow: 0;
  flex-shrink: 1;
  min-height: 0px;
`;
const Composer = styled.View.attrs({ style: { boxShadow: '0px -1px 4px rgba(255, 25, 86, 0.15), 0px 4px 20px rgba(255, 25, 86, 0.15)' } })<{ $embedded: boolean }>`
  padding: ${({ $embedded }) => $embedded ? 0 : 8}px;
  margin-horizontal: ${({ $embedded }) => $embedded ? 12 : 0}px;
  border-radius: ${({ theme }) => theme.liquidGlass.header.radius}px;
  background-color: ${({ theme, $embedded }) => $embedded ? theme.liquidGlass.search.tint : theme.liquidGlass.sheet.tint};
  border-width: ${({ $embedded }) => $embedded ? 0 : 1}px;
  border-color: ${({ theme }) => theme.liquidGlass.header.rim};
`;
const InputRow = styled.View.attrs<{ $embedded: boolean }>(({ theme, $embedded }) => ({ style: { boxShadow: $embedded ? undefined : theme.liquidGlass.search.shadow } }))<{ $embedded: boolean }>`
  min-height: 44px;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding-horizontal: 12px;
  border-radius: ${({ theme }) => theme.liquidGlass.search.radius}px;
  background-color: ${({ theme, $embedded }) => $embedded ? 'transparent' : theme.liquidGlass.search.tint};
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
  flex: 1;
  min-width: 0px;
  min-height: 44px;
  padding: 0px;
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;
const QueryText = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-size: 14px; line-height: 18px; font-weight: 500;`;
const ReviewActions = styled.View`gap: 8px;`;
const Action = styled.Pressable`
  min-height: 48px;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: ${({ theme, disabled }) => disabled ? theme.colors.disabled : theme.colors.surfaceElevated};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.borderEmphasis};
`;
