import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';
import { Text } from '../../../shared/components/Typography';
import type { VoiceCommandViewState } from '../hooks/useVoiceCommands';
import type { VoicePlaceFacts } from '../model/voiceAssistantCommand.types';

export function VoiceCommandResults({ state, onRetry, retryDisabled = false }: { state: VoiceCommandViewState; onRetry: () => void; retryDisabled?: boolean }) {
  const { t } = useTranslation();
  const copy = (key: string) => <Copy testID="voice-command-state" accessibilityLiveRegion="polite">{t(`voiceAssistant.command.${key}`)}</Copy>;
  const clarification = (field: string) => <Copy accessibilityLiveRegion="polite">{t(`voiceAssistant.command.fields.${field}`)}</Copy>;
  const error = (code: string) => <>
    <Copy accessibilityRole="alert">{t(`voiceAssistant.command.errors.${code}`, { defaultValue: t('voiceAssistant.command.failed') })}</Copy>
    <Action testID="voice-command-retry" accessibilityRole="button" accessibilityLabel={t('voiceAssistant.command.retry')}
      accessibilityState={{ disabled: retryDisabled }} disabled={retryDisabled} onPress={onRetry}><Copy>{t('voiceAssistant.command.retry')}</Copy></Action>
  </>;
  const place = (p: VoicePlaceFacts) => <Block key={p.id}><Copy>{p.name}</Copy><Copy>{p.address}</Copy>
    <Copy>{p.touristCategories.join(', ')}</Copy><Copy>{t(`voiceAssistant.command.operating.${p.operatingStatus}`)}</Copy></Block>;
  if (state.phase === 'idle') return null;
  if (state.phase === 'error') return error(state.code);
  if (state.phase === 'clarification') return clarification(state.field);
  if (state.phase !== 'result') return copy(state.phase);
  const result = state.result;
  if (result.outcome.status === 'rejected') return error(result.outcome.code);
  if (result.outcome.status === 'clarification_required') return clarification(result.outcome.field);
  if (result.command === 'searchNearbyReservablePlaces' && result.outcome.status === 'succeeded') {
    return <>{copy('bounded')}{result.outcome.data.places.length ? result.outcome.data.places.map(place)
      : <Copy testID="voice-command-empty">{t('voiceAssistant.command.empty')}</Copy>}</>;
  }
  if (result.command === 'getPlaceDetails' && result.outcome.status === 'succeeded') return place(result.outcome.data.place);
  if (result.command === 'getAvailabilities' && result.outcome.status === 'succeeded') return <>
    {copy('slots')}{result.outcome.data.availabilities.length ? result.outcome.data.availabilities.map(slot => <Block key={slot.id}>
      {slot.productName !== null && <Copy>{slot.productName}</Copy>}<Copy>{slot.productType}</Copy>
      <Copy>{slot.startsAt} – {slot.endsAt}</Copy><Copy>{t('voiceAssistant.command.capacity', { count: slot.remainingCapacity })}</Copy>
    </Block>) : <Copy testID="voice-command-empty">{t('voiceAssistant.command.empty')}</Copy>}
  </>;
  if (result.command === 'cancelVoiceSession') return copy('canceled');
  return null; // #349 owns draft/confirmation presentation.
}
const Block = styled.View`gap: 4px; padding: 12px 0;`;
const Copy = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-size: 16px;`;
const Action = styled.Pressable`min-height: 48px; padding: 12px;`;
