import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';
import { Text, TextInput } from '../../../shared/components/Typography';
import { validateBookerInput, BOOKER_NAME_MAX_LENGTH, BOOKER_PHONE_MAX_LENGTH, REQUEST_NOTE_MAX_LENGTH, type BookerInput } from '../../booking';
import type { VoiceReservationFlow } from '../hooks/useVoiceReservation';
import { formatDraftAmount } from '../model/reservationDraft';

export function VoiceReservationPanel({ flow }: { flow: VoiceReservationFlow }) {
  const { t, i18n } = useTranslation();
  const [booker, setBooker] = useState<BookerInput>({ bookerName: '', bookerPhone: '', requestNote: '' });
  const [showErrors, setShowErrors] = useState(false);
  useEffect(() => { setBooker({ bookerName: '', bookerPhone: '', requestNote: '' }); setShowErrors(false); }, [flow.place?.id]);
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
  return <Panel testID="voice-reservation-panel">
    <Heading>{flow.place?.name}</Heading><Copy>{label('actualSchedule')}</Copy>
    <Heading>{t('reservation.create.people')}</Heading>
    <Row><Action disabled={locked || flow.quantity <= 1} accessibilityRole="button" accessibilityLabel={t('voiceAssistant.picker.decrease')}
      accessibilityState={{ disabled: locked || flow.quantity <= 1 }} onPress={() => flow.setPeople(flow.quantity - 1)}><ActionText>−</ActionText></Action>
      <Copy>{t('reservation.create.peopleCount', { count: flow.quantity })}</Copy>
      <Action disabled={locked || flow.quantity >= 12} accessibilityRole="button" accessibilityLabel={t('voiceAssistant.picker.increase')}
        accessibilityState={{ disabled: locked || flow.quantity >= 12 }} onPress={() => flow.setPeople(flow.quantity + 1)}><ActionText>+</ActionText></Action></Row>
    <Heading>{t('reservation.create.date')}</Heading>
    <Row>{flow.dates.map(date => <Choice key={date} testID={`voice-reservation-date-${date}`} accessibilityRole="button" accessibilityLabel={date}
      accessibilityState={{ selected: flow.date === date, disabled: locked }} disabled={locked} $selected={flow.date === date} onPress={() => flow.selectDate(date)}><ActionText>{date}</ActionText></Choice>)}</Row>
    {flow.date && <Heading>{t('reservation.create.time')}</Heading>}
    <Row>{flow.dateSlots.map(slot => {
      const zone = flow.slotTimezone(slot);
      const formatter = new Intl.DateTimeFormat(i18n.language, { timeZone: zone, dateStyle: 'short', timeStyle: 'short' });
      const window = `${formatter.format(new Date(slot.startsAt))} – ${formatter.format(new Date(slot.endsAt))} (${zone})`;
      return <Choice key={slot.id} testID={`voice-reservation-slot-${slot.id}`} accessibilityRole="button" accessibilityLabel={window}
        accessibilityState={{ selected: flow.selectedId === slot.id, disabled: locked }} disabled={locked} $selected={flow.selectedId === slot.id}
        onPress={() => { void flow.selectSlot(slot.id); }}><ActionText>{window}</ActionText><Copy>{t('voiceAssistant.command.capacity', { count: slot.remainingCapacity })}</Copy></Choice>;
    })}</Row>
    {!busy && flow.dates.length === 0 && <Copy>{label('noSchedule')}</Copy>}
    {(flow.loadError || s.phase === 'error') && <Copy accessibilityRole="alert">{label(s.phase === 'error' && s.code === 'storage' ? 'storage' : 'error')}</Copy>}
    {flow.place && action('refresh', () => { if (flow.place) void flow.selectPlace(flow.place); }, locked)}
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
    {action('cancel', flow.clearSelection, s.phase === 'submitting')}
  </Panel>;
}
const Panel = styled.View`gap: 12px; padding: 16px; border-radius: 16px; background-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const Heading = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-weight: 700; font-size: 16px;`;
const Copy = styled(Text)`color: ${({ theme }) => theme.colors.text}; font-size: 14px;`;
const Row = styled.View`flex-direction: row; flex-wrap: wrap; align-items: center; gap: 8px;`;
const Action = styled.Pressable`padding: 12px; border-radius: 12px; background-color: ${({ theme }) => theme.colors.surface}; opacity: ${({ disabled }) => disabled ? 0.5 : 1};`;
const Choice = styled(Action)<{ $selected: boolean }>`border-width: 1px; border-color: ${({ theme, $selected }) => $selected ? theme.colors.primary : theme.colors.border};`;
const ActionText = styled(Text)`color: ${({ theme }) => theme.colors.primary}; font-size: 14px; font-weight: 600;`;
const Field = styled(TextInput)`padding: 12px; border-radius: 8px; border-width: 1px; border-color: ${({ theme }) => theme.colors.border}; color: ${({ theme }) => theme.colors.text}; background-color: ${({ theme }) => theme.colors.surface};`;
