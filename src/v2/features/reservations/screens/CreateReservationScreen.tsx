import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import BackIcon from '../../../../assets/v2/icons/header/back.svg';
import PendingReservationIcon from '../../../../assets/v2/icons/smRlavy.svg';
import { usePlaceDetail } from '../../place-detail/hooks/usePlaceDetail';
import { useAvailabilities, useCreateReservation } from '../hooks/useReservations';
import {
  addLocalMonths,
  availabilityDateKeys,
  availabilityIncludesDate,
  buildLocalCalendar,
  createReservationIdempotencyKey,
  isAvailabilityBookable,
  localDateKey,
  nearestBookableAvailability,
  nearestUpcomingAvailability,
  startOfLocalDay,
  startOfLocalMonth,
  type Availability,
} from '../model/reservationAvailability';

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

  const bookableAvailabilities = useMemo(
    () => availabilityData.filter((item) => isAvailabilityBookable(item, quantity, now)),
    [availabilityData, now, quantity],
  );
  const availableDates = useMemo(
    () => new Set(bookableAvailabilities.flatMap(availabilityDateKeys)),
    [bookableAvailabilities],
  );
  const scheduledDates = useMemo(
    () => new Set(
      availabilityData
        .flatMap(availabilityDateKeys),
    ),
    [availabilityData],
  );
  const selectedAvailability = availabilityData.find(
    (item) => item.id === selectedAvailabilityId,
  );
  const selectedDateSlots = selectedDate
    ? availabilityData
      .filter((item) => availabilityIncludesDate(item, selectedDate))
      .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime())
    : [];

  useEffect(() => {
    if (initializedFromAvailability.current || availabilities.isPending || availabilities.isError) {
      return;
    }
    const nearest = nearestBookableAvailability(availabilityData, quantity, now)
      ?? nearestUpcomingAvailability(availabilityData, now);
    if (!nearest) return;
    const nearestDate = new Date(nearest.startsAt);
    const initialDate = nearestDate.getTime() <= now.getTime()
      ? now
      : nearestDate;
    initializedFromAvailability.current = true;
    setMonth(startOfLocalMonth(initialDate));
    setSelectedDate(localDateKey(initialDate));
    setSelectedAvailabilityId(null);
  }, [availabilityData, availabilities.isError, availabilities.isPending, now, quantity]);

  useEffect(() => {
    if (selectedAvailabilityId !== null
      && (!selectedAvailability
        || !isAvailabilityBookable(selectedAvailability, quantity, now)
        || !selectedDate
        || !availabilityIncludesDate(selectedAvailability, selectedDate))) {
      setSelectedAvailabilityId(null);
    }
  }, [now, quantity, selectedAvailability, selectedAvailabilityId, selectedDate]);

  const hasValidIdempotencyKey = idempotencyKey.length > 0 && idempotencyKey.length <= 100;
  const canSubmit = Boolean(
    selectedAvailability
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
    if (!canSubmit || !selectedAvailability || submissionGuard.current) return;
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
      <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-reservation-success-screen">
        <SuccessHeader>
          <SuccessBackButton
            accessibilityLabel={t('reservation.common.back')}
            accessibilityRole="button"
            onPress={navigation.goBack}
          >
            <BackIcon height={44} width={44} />
          </SuccessBackButton>
        </SuccessHeader>
        <SuccessContent accessibilityLiveRegion="polite">
          <SuccessIconSurface testID="v2-reservation-success-icon">
            <PendingReservationIcon height={50} width={44} />
          </SuccessIconSurface>
          <SuccessTitle>{t('reservation.create.successTitle')}</SuccessTitle>
          <SuccessDescription>{t('reservation.create.successDescription')}</SuccessDescription>
        </SuccessContent>
        <SuccessFooter>
          <SuccessAction accessibilityRole="button" onPress={navigation.goBack}>
            <SuccessActionLabel>{t('reservation.create.backToMap')}</SuccessActionLabel>
          </SuccessAction>
        </SuccessFooter>
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
            <WeekRow>{WEEKDAY_KEYS.map((day, weekday) => <Weekday $weekday={weekday} key={day}>{t(`reservation.create.weekdays.${day}`)}</Weekday>)}</WeekRow>
            <CalendarGrid>{buildLocalCalendar(month).map((date, index) => date ? (() => {
              const key = localDateKey(date);
              const selected = key === selectedDate;
              const isPast = startOfLocalDay(date).getTime() < startOfLocalDay(now).getTime();
              const available = !isPast && availableDates.has(key);
              const scheduled = scheduledDates.has(key);
              const dateLabel = available
                ? t('reservation.create.availableDateLabel', { date: key })
                : scheduled
                  ? t('reservation.create.scheduledDateLabel', { date: key })
                  : t('reservation.create.unavailableDateLabel', { date: key });
              const selectedAndAvailable = selected && available;
              return <DayCell key={key}><DayButton $selected={selectedAndAvailable} accessibilityLabel={dateLabel} accessibilityRole="button" accessibilityState={{ disabled: !scheduled, selected }} disabled={!scheduled} onPress={() => { setSelectedDate(key); setSelectedAvailabilityId(null); }}><DayText $available={available} $selected={selectedAndAvailable} $weekday={date.getDay()}>{date.getDate()}</DayText></DayButton></DayCell>;
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
            quantity,
            selectedAvailabilityId,
            selectedDate,
            selectedDateSlots,
            setSelectedAvailabilityId,
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
  quantity: number;
  selectedAvailabilityId: number | null;
  selectedDate: string | null;
  selectedDateSlots: Availability[];
  setSelectedAvailabilityId: (id: number) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
  themeColor: string;
};

function renderAvailabilityState(props: AvailabilityStateProps) {
  const { t } = props;
  if (props.isPending) return <StateBox><ActivityIndicator color={props.themeColor} /><Helper>{t('reservation.create.availabilityLoading')}</Helper></StateBox>;
  if (props.isError) return <StateBox><ErrorText>{t('reservation.create.availabilityError')}</ErrorText><RetryButton accessibilityRole="button" onPress={props.onRetry}><RetryText>{t('reservation.create.retry')}</RetryText></RetryButton></StateBox>;
  if (props.availabilityData.length === 0) return <StateBox><Helper>{t('reservation.create.availabilityEmpty')}</Helper></StateBox>;
  if (!props.selectedDate) return <StateBox><Helper>{t('reservation.create.selectAvailableDate')}</Helper></StateBox>;
  if (props.selectedDateSlots.length === 0) return <StateBox><Helper>{t('reservation.create.noTimes')}</Helper></StateBox>;

  return <AvailabilityContent>
    {props.bookableCount === 0 ? <StateBox><Helper>{t('reservation.create.noCapacityForQuantity', { count: props.quantity })}</Helper></StateBox> : null}
    <TimeOptionScroll horizontal showsHorizontalScrollIndicator={false}>{props.selectedDateSlots.map((slot) => {
    const bookable = isAvailabilityBookable(slot, props.quantity, props.now);
    const selected = props.selectedAvailabilityId === slot.id;
    const reason = availabilityReason(slot, props.quantity, props.now, t);
    const label = `${formatTimeRange(slot, props.language)} · ${slot.productType}`;
    return <SlotButton key={slot.id} $bookable={bookable} $selected={selected} accessibilityLabel={`${label}. ${reason}`} accessibilityRole="button" accessibilityState={{ disabled: !bookable, selected }} disabled={!bookable} onPress={() => props.setSelectedAvailabilityId(slot.id)} testID={`v2-availability-${slot.id}`}><SlotLabel $bookable={bookable} $selected={selected}>{label}</SlotLabel></SlotButton>;
    })}</TimeOptionScroll>
  </AvailabilityContent>;
}

function availabilityReason(availability: Availability, quantity: number, now: Date, t: AvailabilityStateProps['t']): string {
  if (availability.status !== 'ACTIVE') return t('reservation.create.slotInactive');
  if (new Date(availability.endsAt).getTime() <= now.getTime()) return t('reservation.create.slotPast');
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
const Weekday = styled.Text<{ $weekday: number }>`width: 14.285%; color: ${({ $weekday, theme }) => $weekday === 0 ? theme.colors.calendarSunday : $weekday === 6 ? theme.colors.calendarSaturday : theme.colors.text}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; text-align: center;`;
const CalendarGrid = styled.View`flex-direction: row; flex-wrap: wrap; margin-top: ${({ theme }) => theme.spacing.xs}px;`;
const DayCell = styled.View`width: 14.285%; height: 46px; align-items: center; justify-content: center;`;
const DayButton = styled.Pressable<{ $selected: boolean }>`width: 40px; height: 40px; align-items: center; justify-content: center; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ $selected, theme }) => $selected ? theme.colors.primary : 'transparent'};`;
const DayText = styled.Text<{ $available: boolean; $selected: boolean; $weekday: number }>`color: ${({ $available, $selected, $weekday, theme }) => $selected ? theme.colors.onPrimary : !$available ? theme.colors.disabled : $weekday === 0 ? theme.colors.calendarSunday : $weekday === 6 ? theme.colors.calendarSaturday : theme.colors.text}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; font-weight: ${({ $available, $selected }) => $available || $selected ? '700' : '400'};`;
const StateBox = styled.View`min-height: 72px; align-items: center; justify-content: center; gap: ${({ theme }) => theme.spacing.sm}px; padding: ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const RetryButton = styled.Pressable`padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.primarySoft};`;
const RetryText = styled.Text`color: ${({ theme }) => theme.colors.primary}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; font-weight: ${({ theme }) => theme.typography.label.fontWeight};`;
const TimeOptionScroll = styled.ScrollView`flex-grow: 0;`;
const AvailabilityContent = styled.View`gap: ${({ theme }) => theme.spacing.sm}px;`;
const SlotButton = styled.Pressable<{ $bookable: boolean; $selected: boolean }>`min-height: 40px; align-items: center; justify-content: center; margin-right: ${({ theme }) => theme.spacing.sm}px; padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px; border-width: 1px; border-color: ${({ $selected, theme }) => $selected ? theme.colors.primary : 'transparent'}; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ $selected, theme }) => $selected ? theme.colors.primarySoft : theme.colors.surfaceMuted}; opacity: ${({ $bookable }) => $bookable ? 1 : 0.48};`;
const SlotLabel = styled.Text<{ $bookable: boolean; $selected: boolean }>`color: ${({ $bookable, $selected, theme }) => $selected ? theme.colors.primary : $bookable ? theme.colors.textMuted : theme.colors.textDisabled}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; font-weight: ${({ $selected, theme }) => $selected ? theme.typography.label.fontWeight : theme.typography.caption.fontWeight};`;
const Helper = styled.Text`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; text-align: center;`;
const ErrorText = styled.Text`color: ${({ theme }) => theme.colors.danger}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; text-align: center;`;
const SubmitButton = styled.Pressable<{ $enabled: boolean }>`height: 56px; align-items: center; justify-content: center; margin-top: ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ $enabled, theme }) => $enabled ? theme.colors.primary : theme.colors.disabled};`;
const SubmitLabel = styled.Text<{ $enabled: boolean }>`color: ${({ $enabled, theme }) => $enabled ? theme.colors.onPrimary : theme.colors.onDisabled}; font-size: ${({ theme }) => theme.typography.body.fontSize}px; font-weight: ${({ theme }) => theme.typography.label.fontWeight};`;
const SuccessHeader = styled.View`height: 72px; justify-content: center; padding: 0 ${({ theme }) => theme.spacing.lg}px;`;
const SuccessBackButton = styled.Pressable`width: 56px; height: 56px; align-items: center; justify-content: center; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.surface}; shadow-color: #000; shadow-offset: 0 8px; shadow-opacity: 0.06; shadow-radius: 20px; elevation: 3;`;
const SuccessContent = styled.View`flex: 1; align-items: center; justify-content: center; gap: ${({ theme }) => theme.spacing.md}px; padding: 0 ${({ theme }) => theme.spacing.lg}px;`;
const SuccessIconSurface = styled.View`width: 96px; height: 96px; align-items: center; justify-content: center; margin-bottom: ${({ theme }) => theme.spacing.sm}px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.primarySoft};`;
const SuccessTitle = styled.Text`color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.title.fontSize}px; font-weight: ${({ theme }) => theme.typography.title.fontWeight}; line-height: ${({ theme }) => theme.typography.title.lineHeight}px; text-align: center;`;
const SuccessDescription = styled.Text`color: ${({ theme }) => theme.colors.textAlternative}; font-size: ${({ theme }) => theme.typography.body.fontSize}px; line-height: ${({ theme }) => theme.typography.body.lineHeight}px; text-align: center;`;
const SuccessFooter = styled.View`padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.lg}px;`;
const SuccessAction = styled.Pressable`height: 64px; align-items: center; justify-content: center; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.primary};`;
const SuccessActionLabel = styled.Text`color: ${({ theme }) => theme.colors.onPrimary}; font-size: ${({ theme }) => theme.typography.onboardingAction.fontSize}px; font-weight: ${({ theme }) => theme.typography.onboardingAction.fontWeight}; line-height: ${({ theme }) => theme.typography.onboardingAction.lineHeight}px;`;
