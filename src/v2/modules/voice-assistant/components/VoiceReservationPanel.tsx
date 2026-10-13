import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';
import { Text, TextInput } from '../../../shared/components/Typography';
import { validateBookerInput, BOOKER_NAME_MAX_LENGTH, BOOKER_PHONE_MAX_LENGTH, REQUEST_NOTE_MAX_LENGTH, type BookerInput } from '../../booking';
import type { VoiceReservationFlow } from '../hooks/useVoiceReservation';
import { formatDraftAmount } from '../model/reservationDraft';
import { VoiceClarificationPicker, formatPickerSelection, localPickerDate, type PickerField, type PickerSelection } from './VoiceClarificationPicker';
import { VoiceConditionChips } from './VoiceConditionChips';

export function VoiceReservationPanel({ flow, request, timezone = 'Asia/Seoul' }: { flow: VoiceReservationFlow; request?: string; timezone?: string }) {
  const { t, i18n } = useTranslation();
  const [booker, setBooker] = useState<BookerInput>({ bookerName: '', bookerPhone: '', requestNote: '' });
  const [showErrors, setShowErrors] = useState(false);
  const [editing, setEditing] = useState<PickerField | null>('quantity');
  const [pendingSlotId, setPendingSlotId] = useState<number | null>(null);
  useEffect(() => { setBooker({ bookerName: '', bookerPhone: '', requestNote: '' }); setShowErrors(false); setEditing(flow.selectedId ? null : flow.date ? 'timeRange' : 'quantity'); }, [flow.place?.id]);
  useEffect(() => { setPendingSlotId(null); }, [flow.place?.id, flow.date, flow.quantity]);
  useEffect(() => {
    // Availability/draft tool results can finish loading with a server-backed date already selected.
    if (!flow.loading && flow.place && flow.date) setEditing(flow.selectedId ? null : 'timeRange');
  }, [flow.loading]);
  const s = flow.state;
  const busy = flow.loading || ['loading', 'checking', 'submitting'].includes(s.phase);
  const locked = busy || s.phase === 'unknown';
  const label = (key: string) => t(`voiceAssistant.reservation.${key}`);
  const action = (key: string, onPress: () => void, disabled = false, id?: string) => <Action testID={id} accessibilityRole="button"
    accessibilityLabel={label(key)} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}><ActionText>{label(key)}</ActionText></Action>;
  if (s.phase === 'error' && s.code === 'storage' && !flow.place) return <Panel><Copy accessibilityRole="alert">{label('storage')}</Copy>{action('recover', () => { void flow.controller.restore(); })}</Panel>;
  if (!flow.place && ['idle', 'review', 'error'].includes(s.phase)) return null;
  if (s.phase === 'success') return <Panel testID="voice-reservation-success" accessibilityLiveRegion="polite">
    <Heading>{t(s.reservation.status === 'PENDING' ? 'reservation.create.successTitle' : 'reservation.detail.title')}</Heading>
    <Copy>{t('voiceAssistant.reservation.number', { id: s.reservation.id })}</Copy>
    <Copy>{t('voiceAssistant.reservation.status', { status: t(`reservation.list.statuses.${s.reservation.status.toLowerCase()}`) })}</Copy>
    <Copy>{t('reservation.create.successDescription')}</Copy>
    {s.reservation.confirmation?.paymentRequired && <Copy>{t('voiceAssistant.command.draft.paymentRequired')}</Copy>}
    {action('done', flow.clearSelection)}
  </Panel>;
  if (s.phase === 'unknown') return <Panel testID="voice-reservation-unknown">
    <Copy accessibilityRole="alert">{label('unknown')}</Copy>
    <Copy>{s.confirmation.placeName}</Copy>
    {action('recover', () => { void flow.controller.retry(); }, false, 'voice-reservation-recover')}
  </Panel>;
  const validation = validateBookerInput(booker);
  const confirmation = s.phase === 'review' ? s.confirmation : null;
  const amount = (value: number) => confirmation ? formatDraftAmount(value, confirmation.currency, confirmation.currencyFractionDigits) : '';
  const slotTime = (slot: VoiceReservationFlow['dateSlots'][number]) => {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: flow.slotTimezone(slot), hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(slot.startsAt));
    return `${parts.find(part => part.type === 'hour')!.value}:${parts.find(part => part.type === 'minute')!.value}`;
  };
  const selectedSlot = flow.dateSlots.find(slot => slot.id === flow.selectedId);
  const pendingSlot = flow.dateSlots.find(slot => slot.id === (pendingSlotId ?? flow.selectedId));
  const slotWindow = (slot: VoiceReservationFlow['dateSlots'][number]) => {
    const zone = flow.slotTimezone(slot), start = new Date(slot.startsAt), end = new Date(slot.endsAt);
    const crossesDate = localPickerDate(zone, start) !== localPickerDate(zone, end);
    const formatter = new Intl.DateTimeFormat(i18n.language, { timeZone: zone, timeStyle: 'short', ...(crossesDate ? { dateStyle: 'short' as const } : {}) });
    return `${formatter.format(start)} – ${formatter.format(end)} (${zone})`;
  };
  const field = editing ?? (!confirmation ? flow.date ? 'timeRange' : 'date' : null);
  const conditions = <VoiceConditionChips editing={field} disabled={locked} values={{
    quantity: String(flow.quantity), ...(flow.date ? { date: flow.date } : {}), ...(selectedSlot ? { timeRange: slotTime(selectedSlot) } : {}),
  }} onEdit={setEditing} />;
  const confirmSelection = (selection: PickerSelection) => {
    if (locked) return;
    if (selection.field === 'quantity') { flow.setPeople(Number(selection.value)); setEditing('date'); }
    else if (selection.field === 'date') { flow.selectDate(selection.value); setEditing('timeRange'); }
  };
  return <Panel testID="voice-reservation-panel">
    {field && field !== 'timeRange' && <VoiceClarificationPicker key={`${flow.place?.id}-${field}-${flow.quantity}-${flow.date}`} field={field} timezone={timezone} request={request}
      conditions={conditions} initialValue={field === 'quantity' ? String(flow.quantity) : flow.date ?? undefined}
      availableDates={flow.dates} disabled={locked} onConfirm={confirmSelection} />}
    {field === 'timeRange' && <Panel testID="voice-reservation-times">
      <QuestionGroup>{!!request && <Query testID="voice-result-request">“{request}”</Query>}<Question accessibilityRole="header">{t('reservation.create.time')}</Question></QuestionGroup>
      {conditions}
      <Panel>{flow.dateSlots.map(slot => <Slot key={slot.id} testID={`voice-reservation-slot-${slot.id}`} accessibilityRole="button"
        accessibilityState={{ selected: pendingSlot?.id === slot.id, disabled: locked }} disabled={locked} $selected={pendingSlot?.id === slot.id}
        onPress={() => setPendingSlotId(slot.id)}>
        <SlotLabel $selected={pendingSlot?.id === slot.id}>{slotWindow(slot)}</SlotLabel>
        <Copy>{t('voiceAssistant.command.capacity', { count: slot.remainingCapacity })}</Copy>
      </Slot>)}</Panel>
      {!busy && !flow.dateSlots.length && <Copy>{label('noSchedule')}</Copy>}
      <TimeConfirm accessibilityRole="button" accessibilityLabel={t('voiceAssistant.picker.confirm')}
        accessibilityState={{ disabled: locked || !pendingSlot }} disabled={locked || !pendingSlot}
        onPress={() => { if (!locked && pendingSlot) { setEditing(null); void flow.selectSlot(pendingSlot.id); } }}>
        <TimeConfirmText>{pendingSlot ? t('voiceAssistant.picker.confirmValue', { value: formatPickerSelection('timeRange', slotTime(pendingSlot), i18n.language) }) : t('voiceAssistant.picker.confirm')}</TimeConfirmText>
      </TimeConfirm>
    </Panel>}
    {!field && conditions}
    {!busy && flow.dates.length === 0 && <Copy>{label('noSchedule')}</Copy>}
    {(flow.loadError || s.phase === 'error') && <Copy accessibilityRole="alert">{label(s.phase === 'error' && s.code === 'storage' ? 'storage' : 'error')}</Copy>}
    {(flow.loadError || s.phase === 'error' || !busy && !flow.dates.length) && flow.place && action('refresh', () => { if (flow.place) void flow.selectPlace(flow.place); }, locked)}
    {confirmation && <>
      <Heading>{label('review')}</Heading>
      {s.phase === 'review' && s.changed && <Copy accessibilityRole="alert">{label('changed')}</Copy>}
      <Copy>{confirmation.placeName}</Copy>
      <Copy>{confirmation.startsAt} – {confirmation.endsAt} ({confirmation.timezone})</Copy>
      <Copy>{t('voiceAssistant.command.draft.quantity', { count: confirmation.quantity })}</Copy>
      <Copy>{t('voiceAssistant.command.draft.unit', { amount: amount(confirmation.unitAmountMinor) })}</Copy>
      <Copy>{t('voiceAssistant.command.draft.additional', { amount: amount(confirmation.additionalAmountMinor) })}</Copy>
      <Copy testID="voice-confirmation-total">{t('voiceAssistant.command.draft.total', { amount: amount(confirmation.totalAmountMinor) })}</Copy>
      <Copy>{t(`voiceAssistant.command.draft.${confirmation.paymentRequired ? 'paymentRequired' : 'noPayment'}`)}</Copy>
      {confirmation.cancellable ? <><Copy>{t('voiceAssistant.command.draft.cancelDeadline', { deadline: confirmation.cancellationDeadline, timezone: confirmation.timezone })}</Copy>
        <Copy>{t('voiceAssistant.command.draft.cancelFee', { amount: amount(confirmation.cancellationFeeMinor) })}</Copy>
        <Copy>{t('voiceAssistant.command.draft.refund', { amount: amount(confirmation.refundableAmountMinor) })}</Copy></> : <Copy>{t('voiceAssistant.command.draft.notCancellable')}</Copy>}
      <Copy>{t('voiceAssistant.command.draft.expires', { expiresAt: confirmation.expiresAt })}</Copy>
      <Heading>{t('reservation.create.booker.title')}</Heading>
      {(['bookerName', 'bookerPhone', 'requestNote'] as const).map(field => {
        const key = field === 'bookerName' ? 'name' : field === 'bookerPhone' ? 'phone' : 'note';
        return <React.Fragment key={field}><Copy>{t(`reservation.create.booker.${key}`)}</Copy>
          <Field testID={`voice-reservation-${field}`} accessibilityLabel={t(`reservation.create.booker.${key}`)} editable={!locked} value={booker[field]}
            keyboardType={field === 'bookerPhone' ? 'phone-pad' : 'default'} multiline={field === 'requestNote'}
            maxLength={field === 'bookerName' ? BOOKER_NAME_MAX_LENGTH : field === 'bookerPhone' ? BOOKER_PHONE_MAX_LENGTH : REQUEST_NOTE_MAX_LENGTH}
            onChangeText={value => setBooker(current => ({ ...current, [field]: value }))} />
          {showErrors && validation.errors[field] && <Copy accessibilityRole="alert">{t(validation.errors[field]!)}</Copy>}
        </React.Fragment>;
      })}
      {action('confirm', () => { setShowErrors(true); if (validation.isValid) void flow.confirm(booker); }, locked, 'voice-reservation-confirm')}
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
const Heading = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-weight: 700; font-size: 16px;`;
const Copy = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-size: 14px;`;
const Row = styled.View`flex-direction: row; flex-wrap: wrap; align-items: center; gap: 8px;`;
const Action = styled.Pressable`padding: 12px; border-radius: 12px; background-color: ${({ theme }) => theme.colors.surface}; opacity: ${({ disabled }) => disabled ? 0.5 : 1};`;
const ActionText = styled(Text)`color: ${({ theme }) => theme.colors.primary}; font-size: 14px; font-weight: 600;`;
const Field = styled(TextInput)`padding: 12px; border-radius: 8px; border-width: 1px; border-color: ${({ theme }) => theme.colors.border}; color: ${({ theme }) => theme.colors.text}; background-color: ${({ theme }) => theme.colors.surface};`;
