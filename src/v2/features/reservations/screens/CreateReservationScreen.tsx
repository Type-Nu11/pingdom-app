import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import BackIcon from '../../../../assets/v2/icons/header/back.svg';
import { usePlaceDetail } from '../../place-detail/hooks/usePlaceDetail';
import { useAvailabilities, useCreateReservation } from '../hooks/useReservations';
import {
  addLocalMonths,
  availabilityDateKey,
  buildLocalCalendar,
  createReservationIdempotencyKey,
  isAvailabilityBookable,
  localDateKey,
  nearestBookableAvailability,
  startOfLocalDay,
  startOfLocalMonth,
  type Availability,
} from '../model/reservationAvailability';
import {
  isSelectableAvailability,
  selectAvailabilityPresentation,
  summarizeAvailabilityPresentations,
  type AvailabilityPresentationSummary,
} from '../model/reservationProduct';

const PEOPLE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

type CreateReservationScreenProps = {
  navigation: { goBack: () => void };
  now?: Date;
  route: { params: { category?: string; imageUrl?: string; placeId: number; placeName?: string } };
};

export default function CreateReservationScreen({ navigation, now: providedNow, route }: CreateReservationScreenProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const now = useRef(providedNow ?? new Date()).current;
  const initializedFromAvailability = useRef(false);
  const submissionGuard = useRef(false);
  const [month, setMonth] = useState(() => startOfLocalMonth(now));
  const [quantity, setQuantity] = useState(2);
  const [selectedDate, setSelectedDate] = useState<string | null>(() => localDateKey(now));
  const [selectedAvailabilityId, setSelectedAvailabilityId] = useState<number | null>(null);
  const [idempotencyKey] = useState(createReservationIdempotencyKey);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const detail = usePlaceDetail(route.params.placeId);
  const availabilities = useAvailabilities(route.params.placeId);
  const createReservation = useCreateReservation();
  const availabilityData = availabilities.data ?? [];

  // Only GENERAL place reservations can be selected and submitted today, so the
  // calendar dots and the nearest-date jump are driven by that subset. TICKET
  // and CLASS slots still render in the time list as disabled rows.
  const bookableAvailabilities = useMemo(
    () => availabilityData.filter(
      (item) => isSelectableAvailability(item) && isAvailabilityBookable(item, quantity, now),
    ),
    [availabilityData, now, quantity],
  );
  const availableDates = useMemo(
    () => new Set(bookableAvailabilities.map(availabilityDateKey)),
    [bookableAvailabilities],
  );
  const availabilitySummary = useMemo(
    () => summarizeAvailabilityPresentations(availabilityData),
    [availabilityData],
  );
  const selectableAvailabilityData = useMemo(
    () => availabilityData.filter(isSelectableAvailability),
    [availabilityData],
  );
  const selectedAvailability = availabilityData.find(
    (item) => item.id === selectedAvailabilityId,
  );
  const selectedDateSlots = selectedDate
    ? availabilityData
      .filter((item) => availabilityDateKey(item) === selectedDate)
      .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime())
    : [];

  useEffect(() => {
    if (initializedFromAvailability.current || availabilities.isPending || availabilities.isError) {
      return;
    }
    const nearest = nearestBookableAvailability(selectableAvailabilityData, quantity, now);
    if (!nearest) return;
    const nearestDate = new Date(nearest.startsAt);
    initializedFromAvailability.current = true;
    setMonth(startOfLocalMonth(nearestDate));
    setSelectedDate(availabilityDateKey(nearest));
    setSelectedAvailabilityId(null);
  }, [selectableAvailabilityData, availabilities.isError, availabilities.isPending, now, quantity]);

  useEffect(() => {
    if (selectedAvailabilityId !== null
      && (!selectedAvailability
        || !isSelectableAvailability(selectedAvailability)
        || !isAvailabilityBookable(selectedAvailability, quantity, now)
        || availabilityDateKey(selectedAvailability) !== selectedDate)) {
      setSelectedAvailabilityId(null);
    }
  }, [now, quantity, selectedAvailability, selectedAvailabilityId, selectedDate]);

  const hasValidIdempotencyKey = idempotencyKey.length > 0 && idempotencyKey.length <= 100;
  const canSubmit = Boolean(
    selectedAvailability
      && isSelectableAvailability(selectedAvailability)
      && isAvailabilityBookable(selectedAvailability, quantity, now)
      && quantity >= 1
      && hasValidIdempotencyKey
      && !createReservation.isPending
      && !isSubmitting,
  );

  const moveMonth = (offset: number) => {
    setMonth((current) => addLocalMonths(current, offset));
    setSelectedDate(null);
    setSelectedAvailabilityId(null);
  };

  const submit = () => {
    if (!canSubmit
      || !selectedAvailability
      || !isSelectableAvailability(selectedAvailability)
      || submissionGuard.current) return;
    submissionGuard.current = true;
    setIsSubmitting(true);
    createReservation.mutate(
      { availabilityId: selectedAvailability.id, idempotencyKey, quantity },
      {
        onError: () => {
          submissionGuard.current = false;
          setIsSubmitting(false);
        },
      },
    );
  };

  if (createReservation.isSuccess) {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <SuccessContent>
          <SuccessMark>✓</SuccessMark>
          <SuccessTitle>{t('reservation.create.successTitle')}</SuccessTitle>
          <Helper>{t('reservation.create.successDescription')}</Helper>
          <SubmitButton $enabled accessibilityRole="button" onPress={navigation.goBack}>
            <SubmitLabel $enabled>{t('reservation.create.backToMap')}</SubmitLabel>
          </SubmitButton>
        </SuccessContent>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-create-reservation-screen">
      <Header>
        <BackButton accessibilityLabel={t('reservation.common.back')} accessibilityRole="button" onPress={navigation.goBack}><BackIcon width={44} height={44} /></BackButton>
        <HeaderTitle>{t('reservation.create.title')}</HeaderTitle><HeaderSpacer />
      </Header>
      <Form keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <PlaceSummary>
          {route.params.imageUrl ? <Thumbnail source={{ uri: route.params.imageUrl }} testID="v2-reservation-place-image" /> : <ThumbnailFallback><ThumbnailFallbackText>⌂</ThumbnailFallbackText></ThumbnailFallback>}
          <PlaceCopy>
            <Helper>{t('reservation.create.peopleRange', { category: route.params.category ?? detail.data?.touristCategories?.[0] ?? '' })}</Helper>
            <PlaceName numberOfLines={1}>{route.params.placeName ?? detail.data?.name ?? t('reservation.create.loadingPlace')}</PlaceName>
          </PlaceCopy><Chevron>›</Chevron>
        </PlaceSummary>

        <Section><SectionTitle>{t('reservation.create.people')}</SectionTitle>
          <Horizontal horizontal showsHorizontalScrollIndicator={false}>
            {PEOPLE.map((count) => <Choice key={count} $selected={quantity === count} accessibilityRole="button" accessibilityState={{ selected: quantity === count }} onPress={() => setQuantity(count)}><ChoiceText $selected={quantity === count}>{t('reservation.create.peopleCount', { count })}</ChoiceText></Choice>)}
          </Horizontal>
        </Section>

        <Section><SectionTitle>{t('reservation.create.date')}</SectionTitle>
          <Calendar>
            <MonthRow><MonthButton accessibilityLabel={t('reservation.create.previousMonth')} accessibilityRole="button" onPress={() => moveMonth(-1)}><MonthButtonText>‹</MonthButtonText></MonthButton><MonthTitle testID="v2-reservation-month">{new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric' }).format(month)}</MonthTitle><MonthButton accessibilityLabel={t('reservation.create.nextMonth')} accessibilityRole="button" onPress={() => moveMonth(1)}><MonthButtonText>›</MonthButtonText></MonthButton></MonthRow>
            <WeekRow>{WEEKDAY_KEYS.map((day) => <Weekday key={day}>{t(`reservation.create.weekdays.${day}`)}</Weekday>)}</WeekRow>
            <CalendarGrid>{buildLocalCalendar(month).map((date, index) => date ? (() => {
              const key = localDateKey(date);
              const selected = key === selectedDate;
              const isPast = startOfLocalDay(date).getTime() < startOfLocalDay(now).getTime();
              const available = !isPast && availableDates.has(key);
              return <DayCell key={key}><DayButton $selected={selected} accessibilityLabel={available ? t('reservation.create.availableDateLabel', { date: key }) : t('reservation.create.unavailableDateLabel', { date: key })} accessibilityRole="button" accessibilityState={{ disabled: !available, selected }} disabled={!available} onPress={() => { setSelectedDate(key); setSelectedAvailabilityId(null); }}><DayText $available={available} $selected={selected}>{date.getDate()}</DayText>{available ? <DayStatus $selected={selected}>{t('reservation.create.available')}</DayStatus> : null}</DayButton></DayCell>;
            })() : <DayCell key={`blank-${index}`} />)}</CalendarGrid>
          </Calendar>
        </Section>

        <Section><SectionTitle>{t('reservation.create.time')}</SectionTitle>
          {renderAvailabilityState({
            availabilityData,
            bookableCount: bookableAvailabilities.length,
            isError: availabilities.isError,
            isPending: availabilities.isPending,
            onRetry: () => { void availabilities.refetch(); },
            placeName: route.params.placeName ?? detail.data?.name ?? t('reservation.create.loadingPlace'),
            quantity,
            selectedAvailabilityId,
            selectedDate,
            selectedDateSlots,
            setSelectedAvailabilityId,
            summary: availabilitySummary,
            t,
            language: i18n.language,
            now,
            themeColor: theme.colors.primary,
          })}
        </Section>

        <Section>
          {createReservation.isError ? <ErrorText>{t('reservation.create.submitError')}</ErrorText> : null}
          <SubmitButton $enabled={canSubmit} accessibilityRole="button" accessibilityState={{ disabled: !canSubmit, busy: createReservation.isPending || isSubmitting }} disabled={!canSubmit} onPress={submit} testID="v2-reservation-submit">
            {createReservation.isPending || isSubmitting ? <ActivityIndicator color={theme.colors.onPrimary} /> : <SubmitLabel $enabled={canSubmit}>{t('reservation.create.submit')}</SubmitLabel>}
          </SubmitButton>
        </Section>
      </Form>
    </Screen>
  );
}

type AvailabilityStateProps = {
  availabilityData: Availability[];
  bookableCount: number;
  isError: boolean;
  isPending: boolean;
  language: string;
  now: Date;
  onRetry: () => void;
  placeName: string;
  quantity: number;
  selectedAvailabilityId: number | null;
  selectedDate: string | null;
  selectedDateSlots: Availability[];
  setSelectedAvailabilityId: (id: number) => void;
  summary: AvailabilityPresentationSummary;
  t: (key: string, options?: Record<string, unknown>) => string;
  themeColor: string;
};

function renderAvailabilityState(props: AvailabilityStateProps) {
  const { t } = props;
  if (props.isPending) return <StateBox><ActivityIndicator color={props.themeColor} /><Helper>{t('reservation.create.availabilityLoading')}</Helper></StateBox>;
  if (props.isError) return <StateBox><ErrorText>{t('reservation.create.availabilityError')}</ErrorText><RetryButton accessibilityRole="button" onPress={props.onRetry}><RetryText>{t('reservation.create.retry')}</RetryText></RetryButton></StateBox>;
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
  if (props.bookableCount === 0) return <StateBox><Helper>{t('reservation.create.noCapacityForQuantity', { count: props.quantity })}</Helper></StateBox>;
  if (!props.selectedDate) return <StateBox><Helper>{t('reservation.create.selectAvailableDate')}</Helper></StateBox>;
  if (props.selectedDateSlots.length === 0) return <StateBox><Helper>{t('reservation.create.noTimes')}</Helper></StateBox>;

  return <SlotList>{props.selectedDateSlots.map((slot) => {
    const presentation = selectAvailabilityPresentation(slot);
    const timeRange = formatTimeRange(slot, props.language);

    if (presentation.kind !== 'place') {
      // TICKET/CLASS without a product name, or an unrecognised type: a disabled
      // row that names only the time and the reason, so it is never mistaken for
      // a bookable place slot and never leaks the raw product type or id.
      const notice = t(presentation.reasonKey);
      return (
        <SlotButton
          key={slot.id}
          $selected={false}
          accessibilityLabel={`${timeRange}. ${notice}`}
          accessibilityRole="button"
          accessibilityState={{ disabled: true, selected: false }}
          disabled
          testID={`v2-availability-${slot.id}`}
        >
          <SlotLabel $selected={false}>{timeRange}</SlotLabel>
          <SlotStatus $enabled={false} $selected={false}>{notice}</SlotStatus>
        </SlotButton>
      );
    }

    const bookable = isAvailabilityBookable(slot, props.quantity, props.now);
    const selected = props.selectedAvailabilityId === slot.id;
    const reason = availabilityReason(slot, props.quantity, props.now, t);
    const label = `${timeRange} · ${props.placeName}`;
    return <SlotButton key={slot.id} $selected={selected} accessibilityLabel={`${label}. ${reason}`} accessibilityRole="button" accessibilityState={{ disabled: !bookable, selected }} disabled={!bookable} onPress={() => props.setSelectedAvailabilityId(slot.id)} testID={`v2-availability-${slot.id}`}><SlotLabel $selected={selected}>{label}</SlotLabel><SlotStatus $enabled={bookable} $selected={selected}>{reason}</SlotStatus></SlotButton>;
  })}</SlotList>;
}

function availabilityReason(availability: Availability, quantity: number, now: Date, t: AvailabilityStateProps['t']): string {
  if (availability.status !== 'ACTIVE') return t('reservation.create.slotInactive');
  if (new Date(availability.startsAt).getTime() < now.getTime()) return t('reservation.create.slotPast');
  if (availability.remainingCapacity < quantity) return t('reservation.create.slotInsufficient', { count: availability.remainingCapacity });
  return t('reservation.create.slotAvailable', { count: availability.remainingCapacity });
}

function formatTimeRange(availability: Availability, language: string): string {
  const formatter = new Intl.DateTimeFormat(language, { hour: '2-digit', hour12: false, minute: '2-digit' });
  return `${formatter.format(new Date(availability.startsAt))}–${formatter.format(new Date(availability.endsAt))}`;
}

const Screen = styled(SafeAreaView)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
const Header = styled.View`height: 64px; flex-direction: row; align-items: center; padding: 0 ${({ theme }) => theme.spacing.md}px; border-bottom-width: 1px; border-bottom-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const BackButton = styled.Pressable`width: 44px; height: 44px; align-items: center; justify-content: center;`;
const HeaderTitle = styled.Text`flex: 1; color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.body.fontSize}px; font-weight: ${({ theme }) => theme.typography.title.fontWeight}; text-align: center;`;
const HeaderSpacer = styled.View`width: 44px;`;
const Form = styled.ScrollView`flex: 1;`;
const PlaceSummary = styled.View`flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.md}px; margin: ${({ theme }) => theme.spacing.md}px; padding: ${({ theme }) => theme.spacing.sm}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const Thumbnail = styled.Image`width: 48px; height: 48px; border-radius: ${({ theme }) => theme.radius.sm}px;`;
const ThumbnailFallback = styled.View`width: 48px; height: 48px; align-items: center; justify-content: center; border-radius: ${({ theme }) => theme.radius.sm}px; background-color: ${({ theme }) => theme.colors.border};`;
const ThumbnailFallbackText = styled.Text`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.title.fontSize}px;`;
const PlaceCopy = styled.View`flex: 1;`;
const PlaceName = styled.Text`color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.body.fontSize}px; font-weight: ${({ theme }) => theme.typography.title.fontWeight};`;
const Chevron = styled.Text`color: ${({ theme }) => theme.colors.textMuted}; font-size: 28px;`;
const Section = styled.View`gap: ${({ theme }) => theme.spacing.sm}px; padding: ${({ theme }) => theme.spacing.md}px; border-top-width: 8px; border-top-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const SectionTitle = styled.Text`color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.label.fontSize}px; font-weight: ${({ theme }) => theme.typography.title.fontWeight};`;
const Horizontal = styled.ScrollView`flex-grow: 0;`;
const Choice = styled.Pressable<{ $selected: boolean }>`min-width: 48px; height: 34px; align-items: center; justify-content: center; margin-right: ${({ theme }) => theme.spacing.sm}px; padding: 0 12px; border-width: 1px; border-color: ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.surfaceMuted}; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ $selected, theme }) => $selected ? theme.colors.primarySoft : theme.colors.surfaceMuted};`;
const ChoiceText = styled.Text<{ $selected: boolean }>`color: ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const Calendar = styled.View`padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.sm}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const MonthRow = styled.View`flex-direction: row; align-items: center; justify-content: center;`;
const MonthButton = styled.Pressable`width: 36px; height: 36px; align-items: center; justify-content: center;`;
const MonthButtonText = styled.Text`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.title.fontSize}px;`;
const MonthTitle = styled.Text`color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.body.fontSize}px; font-weight: ${({ theme }) => theme.typography.title.fontWeight};`;
const WeekRow = styled.View`flex-direction: row; margin-top: ${({ theme }) => theme.spacing.sm}px;`;
const Weekday = styled.Text`width: 14.285%; color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; text-align: center;`;
const CalendarGrid = styled.View`flex-direction: row; flex-wrap: wrap; margin-top: ${({ theme }) => theme.spacing.xs}px;`;
const DayCell = styled.View`width: 14.285%; height: 50px; align-items: flex-start; justify-content: center;`;
const DayButton = styled.Pressable<{ $selected: boolean }>`width: 44px; height: 46px; align-items: center; justify-content: center; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ $selected, theme }) => $selected ? theme.colors.primary : 'transparent'};`;
const DayText = styled.Text<{ $available: boolean; $selected: boolean }>`color: ${({ $available, $selected, theme }) => $selected ? theme.colors.onPrimary : $available ? theme.colors.textStrong : theme.colors.disabled}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; font-weight: ${({ $available, $selected }) => $available || $selected ? '700' : '400'};`;
const DayStatus = styled.Text<{ $selected: boolean }>`color: ${({ $selected, theme }) => $selected ? theme.colors.onPrimary : theme.colors.primary}; font-size: 8px;`;
const StateBox = styled.View`min-height: 72px; align-items: center; justify-content: center; gap: ${({ theme }) => theme.spacing.sm}px; padding: ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const RetryButton = styled.Pressable`padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.primarySoft};`;
const RetryText = styled.Text`color: ${({ theme }) => theme.colors.primary}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; font-weight: ${({ theme }) => theme.typography.label.fontWeight};`;
const SlotList = styled.View`gap: ${({ theme }) => theme.spacing.sm}px;`;
const SlotButton = styled.Pressable<{ $selected: boolean }>`padding: ${({ theme }) => theme.spacing.md}px; border-width: 1px; border-color: ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.border}; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ $selected, theme }) => $selected ? theme.colors.primarySoft : theme.colors.surfaceMuted};`;
const SlotLabel = styled.Text<{ $selected: boolean }>`color: ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.body.fontSize}px; font-weight: ${({ theme }) => theme.typography.label.fontWeight};`;
const SlotStatus = styled.Text<{ $enabled: boolean; $selected: boolean }>`margin-top: ${({ theme }) => theme.spacing.xs}px; color: ${({ $enabled, $selected, theme }) => $selected ? theme.colors.primary : $enabled ? theme.colors.success : theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const Helper = styled.Text`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; text-align: center;`;
const ErrorText = styled.Text`color: ${({ theme }) => theme.colors.danger}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; text-align: center;`;
const SubmitButton = styled.Pressable<{ $enabled: boolean }>`height: 56px; align-items: center; justify-content: center; margin-top: ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ $enabled, theme }) => $enabled ? theme.colors.primary : theme.colors.disabled};`;
const SubmitLabel = styled.Text<{ $enabled: boolean }>`color: ${({ $enabled, theme }) => $enabled ? theme.colors.onPrimary : theme.colors.onDisabled}; font-size: ${({ theme }) => theme.typography.body.fontSize}px; font-weight: ${({ theme }) => theme.typography.label.fontWeight};`;
const SuccessContent = styled.View`flex: 1; align-items: center; justify-content: center; gap: ${({ theme }) => theme.spacing.md}px; padding: ${({ theme }) => theme.spacing.lg}px;`;
const SuccessMark = styled.Text`width: 64px; height: 64px; color: ${({ theme }) => theme.colors.onPrimary}; background-color: ${({ theme }) => theme.colors.success}; border-radius: ${({ theme }) => theme.radius.full}px; font-size: 36px; line-height: 60px; text-align: center;`;
const SuccessTitle = styled.Text`color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.title.fontSize}px; font-weight: ${({ theme }) => theme.typography.title.fontWeight};`;
