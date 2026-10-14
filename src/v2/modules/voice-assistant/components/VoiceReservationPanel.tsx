import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';
import { Text, TextInput } from '../../../shared/components/Typography';
import { validateBookerInput, BOOKER_NAME_MAX_LENGTH, BOOKER_PHONE_MAX_LENGTH, REQUEST_NOTE_MAX_LENGTH } from '../../booking';
import type { VoiceReservationFlow } from '../hooks/useVoiceReservation';
import { VoiceClarificationPicker, formatPickerSelection, localPickerDate, type PickerField, type PickerSelection } from './VoiceClarificationPicker';
import { VoiceConditionChips } from './VoiceConditionChips';
import { VoiceTimeWheel } from './VoiceTimeWheel';
import { VoiceReservationSummary } from './VoiceReservationSummary';

export function VoiceReservationPanel({ flow, request, timezone = 'Asia/Seoul', onInteraction, onShowPlace }: { flow: VoiceReservationFlow; request?: string; timezone?: string; onInteraction?: () => void; onShowPlace?: (placeId: number) => void }) {
  const { t, i18n } = useTranslation();
  const { colors: themeColors } = useTheme();
  const { booker, setBooker } = flow;
  const [editing, setEditing] = useState<PickerField | null>('quantity');
  const [pendingSlotId, setPendingSlotId] = useState<number | null>(null);
  const [pendingTime, setPendingTime] = useState('');
  const [timeMoving, setTimeMoving] = useState(false);
  useEffect(() => { setEditing(flow.selectedId ? null : flow.date ? 'timeRange' : 'quantity'); }, [flow.place?.id]);
  useEffect(() => { setPendingSlotId(null); setPendingTime(''); setTimeMoving(false); }, [flow.place?.id, flow.date, flow.quantity]);
  useEffect(() => {
    // Availability/draft tool results can finish loading with a server-backed date already selected.
    if (!flow.loading && flow.place && flow.date) setEditing(flow.selectedId ? null : 'timeRange');
  }, [flow.loading]);
  const s = flow.state;
  const busy = flow.loading || ['loading', 'checking', 'submitting'].includes(s.phase);
  const locked = busy || s.phase === 'unknown';
  const label = (key: string) => t(`voiceAssistant.reservation.${key}`);
  const action = (key: string, onPress: () => void, disabled = false, id?: string) => <Action $primary={key === 'confirm'} testID={id} accessibilityRole="button"
    accessibilityLabel={label(key)} accessibilityState={{ disabled }} disabled={disabled} onPress={() => { onInteraction?.(); onPress(); }}><ActionText $primary={key === 'confirm'}>{label(key)}</ActionText></Action>;
  if (s.phase === 'error' && s.code === 'storage' && !flow.place) return <Panel><Copy accessibilityRole="alert">{label('storage')}</Copy>{action('recover', () => { void flow.controller.restore(); })}</Panel>;
  if (!flow.place && ['idle', 'review', 'error'].includes(s.phase)) return null;
  if (s.phase === 'success') return <Panel testID="voice-reservation-success" accessibilityLiveRegion="polite">
    <Heading>{t(s.reservation.status === 'PENDING' ? 'reservation.create.successTitle' : 'reservation.detail.title')}</Heading>
    <Copy>{t('voiceAssistant.reservation.number', { id: s.reservation.id })}</Copy>
    <Copy>{t('voiceAssistant.reservation.status', { status: t(`reservation.list.statuses.${s.reservation.status.toLowerCase()}`) })}</Copy>
    <Copy>{t(s.reservation.status === 'PENDING' ? 'voiceAssistant.reservation.pendingDescription' : 'reservation.create.successDescription')}</Copy>
    {action('done', flow.clearSelection)}
  </Panel>;
  if (s.phase === 'unknown') return <Panel testID="voice-reservation-unknown">
    <Copy accessibilityRole="alert">{label('unknown')}</Copy>
    <Copy>{s.confirmation.placeName}</Copy>
    {action('recover', () => { void flow.controller.retry(); }, false, 'voice-reservation-recover')}
  </Panel>;
  const validation = validateBookerInput(booker);
  const confirmation = s.phase === 'review' ? s.confirmation : null;
  const dateTime = (value: string | null) => value && confirmation
    ? new Intl.DateTimeFormat(i18n.language, { timeZone: confirmation.timezone, dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '';
  const slotTime = (slot: VoiceReservationFlow['dateSlots'][number]) => {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: flow.slotTimezone(slot), hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(slot.startsAt));
    return `${parts.find(part => part.type === 'hour')!.value}:${parts.find(part => part.type === 'minute')!.value}`;
  };
  const selectedSlot = flow.dateSlots.find(slot => slot.id === flow.selectedId);
  const availableTimes = [...new Set(flow.dateSlots.map(slotTime))].sort();
  const time = availableTimes.includes(pendingTime) ? pendingTime : selectedSlot ? slotTime(selectedSlot) : availableTimes[0] ?? '';
  const matchingSlots = flow.dateSlots.filter(slot => slotTime(slot) === time);
  const pendingSlot = matchingSlots.length === 1 ? matchingSlots[0] : matchingSlots.find(slot => slot.id === (pendingSlotId ?? flow.selectedId));
  const slotWindow = (slot: VoiceReservationFlow['dateSlots'][number]) => {
    const zone = flow.slotTimezone(slot), start = new Date(slot.startsAt), end = new Date(slot.endsAt);
    const crossesDate = localPickerDate(zone, start) !== localPickerDate(zone, end);
    const formatter = new Intl.DateTimeFormat(i18n.language, { timeZone: zone, timeStyle: 'short', ...(crossesDate ? { dateStyle: 'short' as const } : {}) });
    return `${formatter.format(start)} – ${formatter.format(end)} (${zone})`;
  };
  const field = editing ?? (!confirmation ? flow.date ? 'timeRange' : 'date' : null);
  const conditions = <VoiceConditionChips editing={field} disabled={locked} values={{
    quantity: String(flow.quantity), ...(flow.date ? { date: flow.date } : {}), ...(selectedSlot ? { timeRange: slotTime(selectedSlot) } : {}),
  }} onEdit={field => { onInteraction?.(); setEditing(field); }} />;
  const confirmSelection = (selection: PickerSelection) => {
    if (locked) return;
    onInteraction?.();
    if (selection.field === 'quantity') { flow.setPeople(Number(selection.value)); setEditing('date'); }
    else if (selection.field === 'date') { flow.selectDate(selection.value); setEditing('timeRange'); }
  };
  return <Panel testID="voice-reservation-panel">
    {field && field !== 'timeRange' && <VoiceClarificationPicker key={`${flow.place?.id}-${field}-${flow.quantity}-${flow.date}`} field={field} timezone={timezone} request={request}
      conditions={conditions} initialValue={field === 'quantity' ? String(flow.quantity) : flow.date ?? undefined}
      availableDates={flow.dates} disabled={locked} onConfirm={confirmSelection} />}
    {field === 'timeRange' && <Panel testID="voice-reservation-times">
      <QuestionGroup>{!!request && <Query testID="voice-result-request">“{request}”</Query>}<Question accessibilityRole="header">{t('voiceAssistant.picker.timeRange')}</Question></QuestionGroup>
      {conditions}
      {!!availableTimes.length && <VoiceTimeWheel value={time} availableTimes={availableTimes} disabled={locked} onMoving={moving => { if (moving) onInteraction?.(); setTimeMoving(moving); }}
        onChange={value => { onInteraction?.(); setPendingTime(value); setPendingSlotId(null); }} />}
      {matchingSlots.length > 1 && <Panel>{matchingSlots.map(slot => <Slot key={slot.id} testID={`voice-reservation-slot-${slot.id}`} accessibilityRole="button"
        accessibilityState={{ selected: pendingSlot?.id === slot.id, disabled: locked }} disabled={locked} $selected={pendingSlot?.id === slot.id}
        onPress={() => { onInteraction?.(); setPendingSlotId(slot.id); }}>
        <SlotLabel $selected={pendingSlot?.id === slot.id}>{slotWindow(slot)}</SlotLabel>
        <Copy>{t('voiceAssistant.command.capacity', { count: slot.remainingCapacity })}</Copy>
      </Slot>)}</Panel>}
      {!busy && !flow.dateSlots.length && <Copy>{label('noSchedule')}</Copy>}
      <TimeConfirm accessibilityRole="button" accessibilityLabel={t('voiceAssistant.picker.confirm')}
        accessibilityState={{ disabled: locked || !pendingSlot || timeMoving }} disabled={locked || !pendingSlot || timeMoving}
        onPress={() => { if (!locked && pendingSlot && !timeMoving) { onInteraction?.(); setEditing(null); void flow.selectSlot(pendingSlot.id); } }}>
        <TimeConfirmText>{pendingSlot ? t('voiceAssistant.picker.confirmValue', { value: formatPickerSelection('timeRange', slotTime(pendingSlot), i18n.language) }) : t('voiceAssistant.picker.confirm')}</TimeConfirmText>
      </TimeConfirm>
    </Panel>}
    {!field && !confirmation && conditions}
    {!busy && flow.dates.length === 0 && <Copy>{label('noSchedule')}</Copy>}
    {(flow.loadError || s.phase === 'error') && <Copy accessibilityRole="alert">{label(s.phase === 'error' && s.code === 'storage' ? 'storage' : 'error')}</Copy>}
    {(flow.loadError || s.phase === 'error' || !busy && !flow.dates.length) && flow.place && action('refresh', () => { if (flow.place) void flow.selectPlace(flow.place); }, locked)}
    {confirmation && !field && <>
      {s.phase === 'review' && s.changed && <Copy accessibilityRole="alert">{label('changed')}</Copy>}
      <VoiceReservationSummary confirmation={confirmation} place={flow.place} disabled={locked}
        onEdit={field => { onInteraction?.(); setEditing(field); }} onShowPlace={onShowPlace ? id => { onInteraction?.(); onShowPlace(id); } : undefined} />
      <Heading>{t('reservation.create.booker.title')}</Heading>
      <BookerFields>
      {(['bookerName', 'bookerPhone', 'requestNote'] as const).map(field => {
        const key = field === 'bookerName' ? 'name' : field === 'bookerPhone' ? 'phone' : 'note';
        return <BookerField key={field}><FieldLabel>{t(`reservation.create.booker.${key}`)}{field === 'requestNote' ? ` (${t('reservation.create.booker.noteOptional')})` : ''}</FieldLabel>
          <Field $note={field === 'requestNote'} testID={`voice-reservation-${field}`} accessibilityLabel={t(`reservation.create.booker.${key}`)} editable={!locked} value={booker[field]}
            placeholder={t(`reservation.create.booker.${key}Placeholder`)} placeholderTextColor={themeColors.textMuted}
            keyboardType={field === 'bookerPhone' ? 'phone-pad' : 'default'} multiline={field === 'requestNote'}
            textAlignVertical={field === 'requestNote' ? 'top' : 'center'}
            maxLength={field === 'bookerName' ? BOOKER_NAME_MAX_LENGTH : field === 'bookerPhone' ? BOOKER_PHONE_MAX_LENGTH : REQUEST_NOTE_MAX_LENGTH}
            onChangeText={value => { onInteraction?.(); setBooker(current => ({ ...current, [field]: value })); }} />
          {flow.bookerErrorsVisible && validation.errors[field] && <Copy accessibilityRole="alert">{t(validation.errors[field]!)}</Copy>}
        </BookerField>;
      })}
      </BookerFields>
      <Terms>
        <Heading>{label('review')}</Heading>
        {confirmation.cancellable ? <Copy>{t('voiceAssistant.command.draft.cancelDeadline', { deadline: dateTime(confirmation.cancellationDeadline), timezone: confirmation.timezone })}</Copy>
          : <Copy>{t('voiceAssistant.command.draft.notCancellable')}</Copy>}
        <Copy>{t('voiceAssistant.command.draft.expires', { expiresAt: dateTime(confirmation.expiresAt) })}</Copy>
      </Terms>
      {action('confirm', () => { void flow.confirm(booker); }, locked, 'voice-reservation-confirm')}
    </>}
    {busy && <Row accessibilityLiveRegion="polite"><ActivityIndicator /><Copy>{label('checking')}</Copy></Row>}
    {confirmation && action('cancel', flow.clearSelection, s.phase === 'submitting')}
  </Panel>;
}
const Panel = styled.View`gap: 16px;`;
const QuestionGroup = styled.View`gap: 6px;`;
const Query = styled(Text)`font-size: 14px; line-height: 18px; font-weight: 500; color: ${({ theme }) => theme.colors.text};`;
const Question = styled(Text)`font-size: 16px; line-height: 21px; font-weight: 500; color: ${({ theme }) => theme.colors.textStrong};`;
const Slot = styled.Pressable<{ $selected: boolean }>`padding: 12px 16px; gap: 6px; border-radius: 20px; border-width: 1px;
  border-color: ${({ theme, $selected }) => $selected ? theme.liquidGlass.category.activeBorder : 'transparent'};
  background-color: ${({ theme, $selected }) => $selected ? theme.liquidGlass.category.activeTint : theme.liquidGlass.category.tint};
  opacity: ${({ disabled }) => disabled ? 0.4 : 1};`;
const SlotLabel = styled(Text)<{ $selected: boolean }>`font-size: 16px; line-height: 21px; font-weight: 700;
  color: ${({ theme, $selected }) => $selected ? theme.colors.primary : theme.colors.textStrong};`;
const TimeConfirm = styled.Pressable`min-height: 48px; padding: 12px 16px; border-radius: 24px; align-items: center; justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary}; opacity: ${({ disabled }) => disabled ? 0.4 : 1};`;
const TimeConfirmText = styled(Text)`font-size: 16px; line-height: 21px; font-weight: 700; color: #ffffff; text-align: center;`;
const Heading = styled(Text)`color: ${({ theme }) => theme.colors.textStrong}; font-weight: 700; font-size: 18px; line-height: 24px;`;
const Copy = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-size: 14px;`;
const Row = styled.View`flex-direction: row; flex-wrap: wrap; align-items: center; gap: 8px;`;
const Action = styled.Pressable<{ $primary: boolean }>`min-height: 48px; padding: 12px 16px; border-radius: 24px; align-items: center; justify-content: center;
  background-color: ${({ theme, $primary }) => $primary ? theme.colors.primary : theme.liquidGlass.category.tint}; opacity: ${({ disabled }) => disabled ? 0.4 : 1};`;
const ActionText = styled(Text)<{ $primary: boolean }>`color: ${({ theme, $primary }) => $primary ? theme.colors.textInverse : theme.colors.textStrong}; font-size: 16px; line-height: 21px; font-weight: 700;`;
const BookerFields = styled.View`gap: 32px;`;
const BookerField = styled.View`gap: 4px;`;
const FieldLabel = styled(Text)`font-size: 14px; line-height: 18px; color: ${({ theme }) => theme.colors.textAlternative};`;
const Field = styled(TextInput)<{ $note: boolean }>`min-height: ${({ $note }) => $note ? 139 : 40}px; padding: ${({ $note }) => $note ? '10px 12px' : '10px 0px'};
  border-radius: ${({ $note }) => $note ? 12 : 0}px; border-bottom-width: ${({ $note }) => $note ? 0 : 1}px; border-bottom-color: ${({ theme }) => theme.colors.border};
  font-size: ${({ $note }) => $note ? 14 : 18}px; line-height: ${({ $note }) => $note ? 18 : 24}px;
  color: ${({ theme }) => theme.colors.text}; background-color: ${({ theme, $note }) => $note ? theme.colors.backgroundAssistive : 'transparent'};`;
const Terms = styled.View`gap: 8px; padding: 16px 12px; border-radius: 12px; background-color: ${({ theme }) => theme.colors.backgroundAssistive};`;
