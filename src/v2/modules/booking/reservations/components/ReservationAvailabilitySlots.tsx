import React from 'react';
import styled from 'styled-components/native';
import Skeleton from '../../../../shared/components/Skeleton';
import { Text as AppText } from '../../../../shared/components/Typography';
import { slotTimePeriod, type TimePeriod } from '../hooks/useReservationAvailabilitySelection';
import { isAvailabilityBookable, isAvailabilityUpcoming, localDateKey, type Availability } from '../model/reservationAvailability';
import { selectAvailabilityPresentation, type AvailabilityPresentationSummary } from '../model/reservationProduct';

type AvailabilityStateProps = {
  availabilityData: Availability[];
  bookableCount: number;
  isError: boolean;
  isPending: boolean;
  language: string;
  now: Date;
  placeName: string;
  quantity: number;
  selectedAvailabilityId: number | null;
  selectedDate: string | null;
  selectedDateSlots: Availability[];
  onSelectAvailability: (id: number) => void;
  onChangeTimePeriod: (period: TimePeriod) => void;
  summary: AvailabilityPresentationSummary;
  t: (key: string, options?: Record<string, unknown>) => string;
  timePeriod: TimePeriod;
};

export default function ReservationAvailabilitySlots(props: AvailabilityStateProps) {
  const { t } = props;
  if (props.isPending) return <Skeleton variant="slots" accessibilityLabel={t('reservation.create.availabilityLoading')} style={{ paddingVertical: 16 }} />;
  if (props.isError) return null;
  if (props.availabilityData.length === 0) return <StateBox><Helper>{t('reservation.create.availabilityEmpty')}</Helper></StateBox>;
  // Availabilities exist, but none is a GENERAL place reservation. Say so
  // explicitly instead of reusing the empty or capacity copy, and never present
  // a TICKET/CLASS or unknown-type slot as a place booking.
  if (props.summary.place === 0) {
    const key = props.summary.blockedProduct > 0
      ? 'reservation.create.productInfoUnavailable'
      : 'reservation.create.unknownReservationType';
    return <StateBox><Helper>{t(key)}</Helper></StateBox>;
  }
  if (!props.selectedDate) return <StateBox><Helper>{t('reservation.create.selectAvailableDate')}</Helper></StateBox>;
  if (props.selectedDateSlots.length === 0) return <StateBox><Helper>{t('reservation.create.noTimes')}</Helper></StateBox>;

  // A GENERAL slot exists somewhere, but this date also carries TICKET/CLASS or
  // unknown-type slots. Surface the reason as visible copy, not only per row.
  const blockedKinds = new Set(
    props.selectedDateSlots
      .map((slot) => selectAvailabilityPresentation(slot).kind)
      .filter((kind) => kind !== 'place'),
  );
  const blockedNoticeKey = blockedKinds.has('blockedProduct')
    ? 'reservation.create.productInfoUnavailable'
    : blockedKinds.has('unknownType')
      ? 'reservation.create.unknownReservationType'
      : null;
  const periodSlots = props.selectedDateSlots.filter(
    (slot) => slotTimePeriod(slot) === props.timePeriod,
  );

  return <AvailabilityContent>
    <TimePeriodTabs>
      {(['morning', 'afternoon'] as const).map((period) => (
        <TimePeriodButton
          key={period}
          $selected={props.timePeriod === period}
          accessibilityRole="tab"
          accessibilityState={{ selected: props.timePeriod === period }}
          onPress={() => props.onChangeTimePeriod(period)}
        >
          <TimePeriodLabel $selected={props.timePeriod === period}>
            {t(`reservation.create.${period}`)}
          </TimePeriodLabel>
        </TimePeriodButton>
      ))}
      <TimePeriodRule />
    </TimePeriodTabs>
    {props.bookableCount === 0 ? <StateBox><Helper>{t('reservation.create.noCapacityForQuantity', { count: props.quantity })}</Helper></StateBox> : null}
    {blockedNoticeKey ? <StateBox><Helper>{t(blockedNoticeKey)}</Helper></StateBox> : null}
    {periodSlots.length === 0 ? <PeriodEmpty>{t('reservation.create.noTimesInPeriod')}</PeriodEmpty> : null}
    <TimeOptionScroll horizontal showsHorizontalScrollIndicator={false}>{periodSlots.map((slot) => {
      const presentation = selectAvailabilityPresentation(slot);
      const timeRange = formatTimeRange(slot, props.language);
      const timeLabel = formatSlotLabel(slot, props.language);

      if (presentation.kind !== 'place') {
        // TICKET/CLASS without a product name, or an unrecognised type: a
        // disabled pill that names only the time and its reason, so it is never
        // mistaken for a bookable place slot and never leaks the raw product
        // type or id.
        const notice = t(presentation.reasonKey);
        return (
          <SlotButton
            key={slot.id}
            $bookable={false}
            $selected={false}
            accessibilityLabel={`${timeRange}. ${notice}`}
            accessibilityRole="button"
            accessibilityState={{ disabled: true, selected: false }}
            disabled
            testID={`v2-availability-${slot.id}`}
          >
            <SlotLabel $bookable={false} $selected={false}>{timeLabel}</SlotLabel>
          </SlotButton>
        );
      }

      const bookable = isAvailabilityBookable(slot, props.quantity, props.now);
      const selected = props.selectedAvailabilityId === slot.id;
      const reason = availabilityReason(slot, props.quantity, props.now, t);
      const accessibilityLabel = `${timeRange} · ${props.placeName}. ${reason}`;
      return <SlotButton key={slot.id} $bookable={bookable} $selected={selected} accessibilityLabel={accessibilityLabel} accessibilityRole="button" accessibilityState={{ disabled: !bookable, selected }} disabled={!bookable} onPress={() => props.onSelectAvailability(slot.id)} testID={`v2-availability-${slot.id}`}><SlotLabel $bookable={bookable} $selected={selected}>{timeLabel}</SlotLabel>{!bookable ? <SlotReason $bookable={bookable} $selected={selected}>{reason}</SlotReason> : null}</SlotButton>;
    })}</TimeOptionScroll>
  </AvailabilityContent>;
}

function formatSlotLabel(availability: Availability, language: string): string {
  return new Intl.DateTimeFormat(language, {
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
  }).format(new Date(availability.startsAt));
}

function availabilityReason(availability: Availability, quantity: number, now: Date, t: AvailabilityStateProps['t']): string {
  if (availability.status !== 'ACTIVE') return t('reservation.create.slotInactive');
  if (!isAvailabilityUpcoming(availability, now)) return t('reservation.create.slotPast');
  if (availability.remainingCapacity < quantity) return t('reservation.create.slotInsufficient', { count: availability.remainingCapacity });
  return t('reservation.create.slotAvailable', { count: availability.remainingCapacity });
}

function formatTimeRange(availability: Availability, language: string): string {
  const startsAt = new Date(availability.startsAt);
  const endsAt = new Date(availability.endsAt);
  if (localDateKey(startsAt) === localDateKey(endsAt)) {
    const timeFormatter = new Intl.DateTimeFormat(language, {
      hour: '2-digit',
      hourCycle: 'h23',
      minute: '2-digit',
    });
    return `${timeFormatter.format(startsAt)}–${timeFormatter.format(endsAt)}`;
  }
  const dateTimeFormatter = new Intl.DateTimeFormat(language, {
    day: 'numeric',
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    month: 'short',
  });
  return `${dateTimeFormatter.format(startsAt)}–${dateTimeFormatter.format(endsAt)}`;
}

const StateBox = styled.View`min-height: 72px; align-items: center; justify-content: center; gap: ${({ theme }) => theme.spacing.sm}px; padding: ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const TimeOptionScroll = styled.ScrollView`flex-grow: 0;`;
const AvailabilityContent = styled.View`gap: ${({ theme }) => theme.spacing.sm}px;`;
const TimePeriodTabs = styled.View`height: 38px; flex-direction: row; align-items: flex-start; position: relative;`;
const TimePeriodButton = styled.Pressable<{ $selected: boolean }>`height: 38px; justify-content: flex-start; margin-right: ${({ theme }) => theme.spacing.lg}px; border-bottom-width: 2px; border-bottom-color: ${({ $selected, theme }) => $selected ? theme.colors.primary : 'transparent'}; z-index: 1;`;
const TimePeriodLabel = styled(AppText)<{ $selected: boolean }>`color: ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const TimePeriodRule = styled.View`position: absolute; left: 0; right: 0; bottom: 0; height: 1px; background-color: ${({ theme }) => theme.colors.border};`;
const PeriodEmpty = styled(AppText)`padding: ${({ theme }) => theme.spacing.sm}px 0; color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const SlotButton = styled.Pressable<{ $bookable: boolean; $selected: boolean }>`min-width: 56px; min-height: 34px; align-items: center; justify-content: center; margin-right: ${({ theme }) => theme.spacing.sm}px; padding: 6px 12px; border-width: 1px; border-color: ${({ $selected, theme }) => $selected ? theme.colors.primary : 'transparent'}; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ $selected, theme }) => $selected ? theme.colors.primarySoft : theme.colors.surfaceMuted}; opacity: ${({ $bookable }) => $bookable ? 1 : 0.48};`;
const SlotLabel = styled(AppText)<{ $bookable: boolean; $selected: boolean }>`color: ${({ $bookable, $selected, theme }) => $selected ? theme.colors.primary : $bookable ? theme.colors.textMuted : theme.colors.textDisabled}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; font-weight: ${({ $selected, theme }) => $selected ? theme.typography.label.fontWeight : theme.typography.caption.fontWeight};`;
const SlotReason = styled(AppText)<{ $bookable: boolean; $selected: boolean }>`margin-top: 2px; color: ${({ $bookable, $selected, theme }) => $selected ? theme.colors.primary : $bookable ? theme.colors.textAlternative : theme.colors.textDisabled}; font-size: 10px;`;
const Helper = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; text-align: center;`;
