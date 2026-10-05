import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Keyboard, Linking } from 'react-native';
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
import { VoiceClarificationPicker, formatPickerSelection, type PickerField, type PickerSelection } from '../components/VoiceClarificationPicker';
import type { VoiceCommandViewState } from '../hooks/useVoiceCommands';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { expoSpeechInputAdapter } from '../adapters/expoSpeechInputAdapter';
import { retainInputLocally, validateVoiceInput, type OnFinalInput, type SpeechInputAdapter } from '../model/voiceInput';

export type VoiceAssistantScreenProps = {
  onClose: () => void;
  adapter?: SpeechInputAdapter;
  autoStart?: boolean;
  commandState?: VoiceCommandViewState;
  onCommandCancel?: () => void;
  onCommandFeedbackDismiss?: () => void;
  onCommandRetry?: () => void;
  commandRetryDisabled?: boolean;
  timezone?: string;
  // Only informational text; never maps to success UI, execution or TTS.
  guidance?: { kind: 'assistant' | 'clarification' | 'invalidResponse'; text?: string };
} & (
  | { serverSubmission?: false; onFinalInput?: OnFinalInput }
  | { serverSubmission: true; onFinalInput: OnFinalInput }
);
export default function VoiceAssistantScreen({ onClose, adapter = expoSpeechInputAdapter, autoStart = false, onFinalInput = retainInputLocally, serverSubmission = false, guidance, commandState, onCommandCancel, onCommandFeedbackDismiss, onCommandRetry, commandRetryDisabled, timezone = 'Asia/Seoul' }: VoiceAssistantScreenProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const clarificationField = commandState?.phase === 'clarification' ? commandState.field
    : commandState?.phase === 'result' && commandState.result.outcome.status === 'clarification_required'
      ? commandState.result.outcome.field : undefined;
  const originalRequest = useRef('');
  const answers = useRef<Record<string, string>>({});
  const inputContext = useRef({ onFinalInput, clarificationField });
  inputContext.current = { onFinalInput, clarificationField };
  const submitWithQuestionContext = useCallback<OnFinalInput>(input => {
    const context = inputContext.current;
    let text = input.text;
    if (context.clarificationField && originalRequest.current && !text.startsWith(`${originalRequest.current}\n`)) {
      const next = { ...answers.current, [context.clarificationField]: text };
      text = `${originalRequest.current}\n${Object.values(next).join('\n')}`;
      if (validateVoiceInput(text).error) throw new Error('VOICE_INPUT_TOO_LONG');
      answers.current = next;
    } else if (!context.clarificationField && !text.startsWith(`${originalRequest.current}\n`)) {
      originalRequest.current = text; answers.current = {};
    }
    return context.onFinalInput({ ...input, text });
  }, []);
  const { controller, state } = useVoiceInput(adapter, submitWithQuestionContext, clarificationField === 'quantity' ? 'quantity' : undefined);
  const [editingInSheet, setEditingInSheet] = useState(false);
  const [selections, setSelections] = useState<Partial<Record<PickerField, string>>>({});
  const [editingPicker, setEditingPicker] = useState<PickerField | null>(null);
  const [selectionError, setSelectionError] = useState(false);
  const confirming = useRef(false);
  const pickerField = editingPicker ?? (clarificationField === 'date' || clarificationField === 'timeRange' || clarificationField === 'quantity' ? clarificationField : null);
  useEffect(() => {
    // A new account/session consumer must not inherit the previous user's input conditions.
    controller.cancel(); originalRequest.current = ''; answers.current = {};
    setSelections({}); setEditingPicker(null); setSelectionError(false);
  }, [controller, onFinalInput]);
  const busy = ['permissionRequesting', 'listening', 'processing'].includes(state.phase);
  const pending = state.delivery === 'pending';
  const feedback = commandState?.phase === 'unrecognized' ? 'unrecognized' : state.error === 'noSpeech' ? 'noSpeech' : null;
  const previousTurnVisible = state.delivery !== 'none' || !!feedback || (!!commandState && commandState.phase !== 'idle');
  const showDetails = (state.phase !== 'listening' || !!pickerField) && ((state.source === 'voice' && !!state.draft) || busy || !!state.error
    || state.phase === 'permissionDenied' || state.phase === 'unavailable' || !!guidance
    || state.delivery !== 'none' || editingInSheet || !!editingPicker || (commandState && commandState.phase !== 'idle'));
  const pickerVisible = !!pickerField && (!selections[pickerField] || !!editingPicker);
  const confirmSelection = async (selection: PickerSelection) => {
    if (confirming.current || busy || pending) return;
    const next = { ...selections, [selection.field]: selection.value };
    const base = originalRequest.current || state.draft;
    const nextAnswers = { ...answers.current, [selection.field]: `${t(`voiceAssistant.picker.${selection.field}`)} ${selection.value}` };
    const conditions = Object.values(nextAnswers).join('\n');
    const request = `${base}\n${conditions}`.trim();
    if (validateVoiceInput(request).error) { setSelectionError(true); return; }
    confirming.current = true;
    originalRequest.current = base;
    answers.current = nextAnswers;
    setSelections(next); setEditingPicker(null); setSelectionError(false);
    // A choice is still ordinary input through the existing validated AI command boundary.
    // No Booking mutation, route, or direct domain API is accessible to this picker.
    controller.cancel(); controller.edit(request);
    try { await controller.submit(); } finally { confirming.current = false; }
  };
  const close = () => { controller.cancel(); onCommandCancel?.(); onClose(); };
  const clearExpectedSelection = () => {
    if (clarificationField === 'date' || clarificationField === 'timeRange' || clarificationField === 'quantity') {
      setSelections(current => { const next = { ...current }; delete next[clarificationField]; return next; });
    }
  };
  const start = () => {
    clearExpectedSelection();
    if (!clarificationField && !editingPicker) {
      setSelections({}); originalRequest.current = ''; answers.current = {};
    }
    Keyboard.dismiss();
    controller.setForeground(AppState.currentState === 'active');
    void controller.start(i18n.resolvedLanguage === 'ko' ? 'ko-KR' : 'en-US');
  };
  const dismissFeedback = () => { controller.cancel(); onCommandFeedbackDismiss?.(); };
  const retrySpeech = () => { dismissFeedback(); start(); };
  const startedOnEntry = useRef(false);
  useEffect(() => {
    if (!autoStart || startedOnEntry.current) return;
    startedOnEntry.current = true;
    if (AppState.currentState !== 'active') return;
    Keyboard.dismiss();
    controller.setForeground(true);
    void controller.start(i18n.resolvedLanguage === 'ko' ? 'ko-KR' : 'en-US');
  }, [autoStart, controller, i18n.resolvedLanguage]);
  const submitDisabled = busy || pending || validateVoiceInput(state.draft).error !== null || state.delivery !== 'none';
  const settingsButton = () => (
    <Action accessibilityRole="button" accessibilityLabel={t('voiceAssistant.settings')} onPress={() => { controller.cancel(); void Linking.openSettings().catch(() => undefined); }}>
      <Label>{t('voiceAssistant.settings')}</Label>
    </Action>
  );
  const composer = (embedded = false) => <Composer testID="voice-assistant-composer" $embedded={embedded}>
    <InputRow $embedded={embedded}>
      <AssistantIcon />
      {state.phase === 'listening' ? <ListeningText testID={state.partial ? 'voice-partial' : 'voice-listening-prompt'}
        accessibilityLiveRegion="polite" numberOfLines={1}>{state.partial || state.draft || t('voiceAssistant.listeningPrompt')}</ListeningText>
        : <Input accessibilityLabel={t('voiceAssistant.input')}
        onFocus={() => {
          clearExpectedSelection();
          if (showDetails) setEditingInSheet(true);
          if (previousTurnVisible) {
            controller.edit('');
            if (!clarificationField && !editingPicker) { setSelections({}); originalRequest.current = ''; onCommandFeedbackDismiss?.(); }
          }
        }}
        onBlur={() => setEditingInSheet(false)}
        placeholder={t('voiceAssistant.placeholder')} placeholderTextColor={pickerVisible ? theme.colors.textAlternative : theme.colors.textMuted}
        value={feedback ? '' : state.draft} onChangeText={text => { if (previousTurnVisible && !clarificationField && !editingPicker) onCommandFeedbackDismiss?.(); controller.edit(text); }} returnKeyType="send"
        onSubmitEditing={() => { if (!submitDisabled) void controller.submit(); }}
        autoCorrect={false} spellCheck={false} autoComplete="off" />}
      {state.phase === 'listening' ? <RecordingButton accessibilityRole="button" accessibilityLabel={t('voiceAssistant.stop')}
        onPress={() => { void controller.stop(); }}>
        <StopIcon />
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
  const conditionChips = Object.keys(selections).length > 0 ? <ConditionRow horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
    {Object.entries(selections).map(([field, value]) => <SelectionChip key={field} accessibilityRole="button"
      accessibilityLabel={`${value} · ${t('voiceAssistant.picker.edit')}`} disabled={busy || pending}
      onPress={() => { controller.cancel(); setEditingPicker(field as PickerField); onCommandFeedbackDismiss?.(); }}>
      <SelectionLabel>{field === 'quantity' ? t('voiceAssistant.picker.people', { count: Number(value) }) : formatPickerSelection(field as PickerField, value, i18n.language)} · <EditLabel>{t('voiceAssistant.picker.edit')}</EditLabel></SelectionLabel>
    </SelectionChip>)}
  </ConditionRow> : undefined;
  return (
    <KeyboardProvider><Screen testID="voice-assistant-screen" accessibilityViewIsModal onAccessibilityEscape={close}>
      <Backdrop accessibilityRole="button"
        accessibilityLabel={t('voiceAssistant.close')} accessible={!showDetails} onPress={close} />
      <AssistantEdgeGlow speaking={state.phase === 'listening' && state.speaking} />
      <SafeArea edges={['top', 'left', 'right']} pointerEvents="box-none">
        <KeyboardAvoidingView testID="voice-assistant-keyboard-layout" behavior="padding" style={{ flex: 1 }} pointerEvents="box-none">
        <KeyboardLayout pointerEvents="box-none" style={{ paddingBottom: Math.max(insets.bottom, 24) + 12 }}>
          {showDetails ? <Sheet $question={pickerVisible} testID="voice-assistant-details">
            <SheetHeading>
            <Grabber />
            <Header $question={pickerVisible}>
              <Title accessibilityRole="header"><PingdyIcon /><TitleText>{t('voiceAssistant.brand')}</TitleText></Title>
              <CloseButton accessibilityRole="button" accessibilityLabel={t('voiceAssistant.close')} onPress={close}>
                <CloseIcon />
              </CloseButton>
            </Header>
            </SheetHeading>
            <Content keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: pickerVisible ? 0 : 10, gap: pickerVisible ? 16 : 8 }}>
            {feedback ? <>
              {feedback === 'unrecognized' && !!state.draft && <QueryText>“{state.draft}”</QueryText>}
              <FeedbackMessage accessibilityRole="alert">{t(`voiceAssistant.feedback.${feedback}`)}</FeedbackMessage>
              <FeedbackActions>
                <FeedbackRetry accessibilityRole="button" accessibilityLabel={t('voiceAssistant.feedback.retry')}
                  onPress={retrySpeech}><FeedbackRetryText>{t('voiceAssistant.feedback.retry')}</FeedbackRetryText></FeedbackRetry>
                <FeedbackDismiss accessibilityRole="button" accessibilityLabel={t('voiceAssistant.feedback.dismiss')}
                  onPress={dismissFeedback}><FeedbackDismissText>{t('voiceAssistant.feedback.dismiss')}</FeedbackDismissText></FeedbackDismiss>
              </FeedbackActions>
            </> : <>
            {!!state.draft && !pickerVisible && <QueryText>“{state.draft}”</QueryText>}
            {(busy || state.phase === 'permissionDenied' || state.phase === 'unavailable') && <Copy accessibilityLiveRegion="polite">{t(`voiceAssistant.phases.${state.phase}`)}</Copy>}
            {state.phase === 'permissionDenied' && <Copy accessibilityRole="alert">{t(`voiceAssistant.permissions.${state.permission}`)}</Copy>}
            {state.permission === 'blocked' && settingsButton()}
            {state.error && <Copy accessibilityRole="alert">{t(`voiceAssistant.errors.${state.error}`)}</Copy>}
            {!!state.draft && !serverSubmission && state.source === 'text' && <Copy>{t('voiceAssistant.preview')}</Copy>}
            {!pickerVisible && conditionChips}
            {pickerField && pickerVisible && <VoiceClarificationPicker key={pickerField}
              field={pickerField} timezone={timezone} initialValue={selections[pickerField]} disabled={busy || pending}
              request={originalRequest.current || state.draft} conditions={conditionChips}
              onConfirm={selection => { void confirmSelection(selection); }} />}
            {selectionError && <Copy accessibilityRole="alert">{t('voiceAssistant.picker.tooLong')}</Copy>}
            {commandState && !(pickerField && clarificationField) && <VoiceCommandResults state={commandState} retryDisabled={commandRetryDisabled} onShowMap={close} onRetry={() => {
              if (onCommandRetry) onCommandRetry();
              else { const draft = state.draft; controller.cancel(); controller.edit(draft); void controller.submit(); }
            }} />}
            {state.delivery === 'localOnly' && <Copy accessibilityLiveRegion="polite">{t('voiceAssistant.localOnly')}</Copy>}
            {guidance && <Copy>{t('voiceAssistant.advisory')}</Copy>}
            {guidance && <>
              {guidance.kind !== 'assistant' && <Label>{t(`voiceAssistant.${guidance.kind}`)}</Label>}
              {guidance.kind !== 'invalidResponse' && guidance.text && <Copy>{guidance.text}</Copy>}
            </>}
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
const RecordingButton = styled.Pressable`height: 44px; flex-direction: row; align-items: center; gap: 12px; margin-right: 0px;`;
const Waveform = styled.View`height: 24px; flex-direction: row; align-items: center; gap: 3px;`;
const WaveBar = styled.View<{ $height: number; $strong?: boolean }>`
  width: 3px; height: ${({ $height }) => $height}px; border-radius: 2px;
  background-color: ${({ $strong }) => $strong ? '#ff1956' : '#ff4a75'};
`;
const Sheet = styled.View.attrs(({ theme }) => ({ style: { boxShadow: theme.liquidGlass.sheet.shadow } }))<{ $question: boolean }>`
  width: 100%; max-width: 386px; max-height: 78%; align-self: center; padding-top: 6px; padding-bottom: 12px;
  gap: ${({ $question }) => $question ? 16 : 8}px; border-radius: 36px; overflow: ${({ $question }) => $question ? 'hidden' : 'visible'}; background-color: ${({ theme }) => theme.liquidGlass.sheet.tint};
`;
const Grabber = styled.View`width: 56px; height: 5px; border-radius: 3px; align-self: center; background-color: #bfc1c1;`;
const SheetHeading = styled.View`gap: 8px;`;
const Header = styled.View<{ $question: boolean }>`height: ${({ $question }) => $question ? 32 : 40}px; padding-horizontal: 16px; flex-direction: row; align-items: center; justify-content: space-between;`;
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
const Composer = styled.View.attrs({ style: { boxShadow: '0px 4px 4px rgba(255, 25, 86, 0.15), 0px 4px 20px rgba(255, 25, 86, 0.15)' } })<{ $embedded: boolean }>`
  padding: ${({ $embedded }) => $embedded ? 0 : 8}px;
  margin-horizontal: ${({ $embedded }) => $embedded ? 12 : 0}px;
  border-radius: ${({ theme, $embedded }) => $embedded ? theme.liquidGlass.search.radius : theme.liquidGlass.header.radius}px;
  background-color: ${({ theme, $embedded }) => $embedded ? (theme.colorScheme === 'dark' ? theme.liquidGlass.search.tint : 'rgba(228, 228, 229, 0.64)') : theme.liquidGlass.sheet.tint};
  border-width: ${({ $embedded }) => $embedded ? 0 : 1}px;
  border-color: ${({ theme }) => theme.liquidGlass.header.rim};
`;
const InputRow = styled.View.attrs(({ theme }) => ({ style: { boxShadow: theme.liquidGlass.search.shadow } }))<{ $embedded: boolean }>`
  min-height: ${({ $embedded }) => $embedded ? 48 : 44}px;
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
const ConditionRow = styled.ScrollView`flex-grow: 0; overflow: visible;`;
const SelectionChip = styled.Pressable.attrs(({ theme }) => ({ style: { boxShadow: theme.liquidGlass.category.shadow } }))`height: 34px; padding: 8px 16px; border-radius: 16px;
  background-color: ${({ theme }) => theme.liquidGlass.category.tint}; opacity: ${({ disabled }) => disabled ? 0.4 : 1};`;
const SelectionLabel = styled(Text)`font-size: 14px; line-height: 18px; font-weight: 500; color: ${({ theme }) => theme.colors.textAlternative};`;
const EditLabel = styled(SelectionLabel)`color: ${({ theme }) => theme.colors.primary};`;
const Input = styled(TextInput)`
  flex: 1;
  min-width: 0px;
  min-height: 44px;
  padding: 0px;
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;
const ListeningText = styled(Text)`
  flex: 1;
  min-width: 0px;
  font-family: ${({ theme }) => theme.typography.body.fontFamily};
  font-size: 18px;
  font-weight: 500;
  line-height: 23px;
  color: ${({ theme }) => theme.colors.textMuted};
`;
const QueryText = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-size: 14px; line-height: 18px; font-weight: 500;`;
const FeedbackMessage = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-size: 16px; line-height: 21px; font-weight: 500;`;
const FeedbackActions = styled.View`flex-direction: row; gap: 8px; padding-top: 8px;`;
const FeedbackButton = styled.Pressable.attrs(({ theme }) => ({ style: { boxShadow: theme.liquidGlass.category.shadow } }))`
  min-height: 34px; padding: 8px 16px; border-radius: 16px; align-items: center; justify-content: center;
`;
const FeedbackRetry = styled(FeedbackButton)`background-color: ${({ theme }) => theme.liquidGlass.category.activeTint}; border-width: 1px; border-color: ${({ theme }) => theme.liquidGlass.category.activeBorder};`;
const FeedbackDismiss = styled(FeedbackButton)`background-color: ${({ theme }) => theme.liquidGlass.category.tint};`;
const FeedbackRetryText = styled(Text)`color: ${({ theme }) => theme.colors.primary}; font-size: 14px; line-height: 18px; font-weight: 500;`;
const FeedbackDismissText = styled(Text)`color: ${({ theme }) => theme.colors.textAlternative}; font-size: 14px; line-height: 18px; font-weight: 500;`;
const Action = styled.Pressable`
  min-height: 48px;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: ${({ theme, disabled }) => disabled ? theme.colors.disabled : theme.colors.surfaceElevated};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.borderEmphasis};
`;
