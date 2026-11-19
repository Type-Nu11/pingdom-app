import CalendarScrollView from '../../../../shared/components/CalendarScrollView';
import { ApiErrorState, Button } from '../../../../shared/components';
import { Text as AppText, TextInput as AppTextInput } from '../../../../shared/components/Typography';
import React, { useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import BackIcon from '../../../../../assets/v2/icons/header/back.svg';
import { useHeaderGlassIconColors } from '../../../../shared/components/headerGlassIcon';
import PendingReservationIcon from '../../../../../assets/v2/icons/smRlavy.svg';
import { reservationSubmitErrorKey, shouldRefreshReservationAvailability } from '../model/reservationError';
import { useReservationPlaceSummary } from '../hooks/useReservationPlaceSummary';
import { useAvailabilities, useCreateReservation } from '../hooks/useReservations';
import {
  buildLocalCalendar,
  createReservationIdempotencyKey,
  isAvailabilityBookable,
  localDateKey,
  startOfLocalDay,
} from '../model/reservationAvailability';
import {
  BOOKER_NAME_MAX_LENGTH,
  BOOKER_PHONE_MAX_LENGTH,
  REQUEST_NOTE_MAX_LENGTH,
  formatReservationWindow,
  maskBookerName,
  toBookerRequestFields,
  validateBookerInput,
} from '../model/reservationBooker';
import { isSelectableAvailability } from '../model/reservationProduct';
import { useReservationAvailabilitySelection } from '../hooks/useReservationAvailabilitySelection';
import ReservationAvailabilitySlots from '../components/ReservationAvailabilitySlots';

const PEOPLE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

// Maps the classified create error to submit-copy. Anything unlisted (auth,
// not-found, generic, …) falls back to the generic retry message.

type CreateReservationScreenProps = {
  navigation: { goBack: () => void; navigate?: (screen: 'ReservationBox') => void };
  now?: Date;
  route: { params: { category?: string; imageUrl?: string; placeId: number; placeName?: string } };
};

export default function CreateReservationScreen({ navigation, now: providedNow, route }: CreateReservationScreenProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const headerIconColors = useHeaderGlassIconColors();
  const now = useRef(providedNow ?? new Date()).current;
  const submissionGuard = useRef(false);
  const [bookerName, setBookerName] = useState('');
  const [bookerPhone, setBookerPhone] = useState('');
  const [requestNote, setRequestNote] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(createReservationIdempotencyKey);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBookerErrors, setShowBookerErrors] = useState(false);
  const detail = useReservationPlaceSummary(route.params.placeId);
  const availabilities = useAvailabilities(route.params.placeId);
  const createReservation = useCreateReservation(route.params.placeId);
  const availabilityData = availabilities.data ?? [];

  const beginNewReservationIntent = () => {
    createReservation.reset?.();
    setIdempotencyKey(createReservationIdempotencyKey());
  };

  const bookerInput = { bookerName, bookerPhone, requestNote };
  const bookerValidation = validateBookerInput(bookerInput);
  const bookerErrorKeyFor = (field: keyof typeof bookerValidation.errors) =>
    showBookerErrors ? bookerValidation.errors[field] : null;
  const {
    month, moveMonth, quantity, selectQuantity, dateDrag, selectedDate, availableDates,
    scheduledDates, remainingCapacityByDate, bookableCount, availabilitySummary,
    selectedAvailability, selectedAvailabilityId, selectedDateSlots, selectAvailability,
    timePeriod, setTimePeriod,
  } = useReservationAvailabilitySelection({
    availabilityData,
    isError: availabilities.isError,
    isPending: availabilities.isPending,
    now,
    onIntentChange: beginNewReservationIntent,
  });

  const hasValidIdempotencyKey = idempotencyKey.length > 0 && idempotencyKey.length <= 100;
  const slotReady = Boolean(
    selectedAvailability
      && isSelectableAvailability(selectedAvailability)
      && isAvailabilityBookable(selectedAvailability, quantity, now)
      && quantity >= 1
      && hasValidIdempotencyKey
      && !createReservation.isPending
      && !isSubmitting,
  );
  const canSubmit = slotReady && bookerValidation.isValid;

  const submit = () => {
    if (!slotReady
      || !selectedAvailability
      || !isSelectableAvailability(selectedAvailability)
      || !isAvailabilityBookable(selectedAvailability, quantity, providedNow ?? new Date())
      || submissionGuard.current) return;
    if (!bookerValidation.isValid) {
      setShowBookerErrors(true);
      return;
    }
    submissionGuard.current = true;
    setIsSubmitting(true);
    createReservation.mutate(
      {
        availabilityId: selectedAvailability.id,
        idempotencyKey,
        quantity,
        ...toBookerRequestFields(bookerInput),
      },
      {
        onError: (error) => {
          submissionGuard.current = false;
          setIsSubmitting(false);
          if (shouldRefreshReservationAvailability(error)) {
            // The server definitively rejected this write. A retry after the refreshed
            // availability is a new reservation attempt, not a replay of the rejected one.
            setIdempotencyKey(createReservationIdempotencyKey());
            void availabilities.refetch();
          }
        },
      },
    );
  };

  const submitErrorKey = createReservation.isError
    ? reservationSubmitErrorKey(createReservation.error, availabilityData.find(item => item.id === createReservation.variables?.availabilityId), providedNow ?? new Date())
    : null;

  if (createReservation.isSuccess) {
    const created = createReservation.data;
    const createdWindow = formatReservationWindow(created, i18n.language);
    const createdBookerName = maskBookerName(created?.bookerName);
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-reservation-success-screen">
        <SuccessHeader>
          <SuccessBackButton
            accessibilityLabel={t('reservation.common.back')}
            accessibilityRole="button"
            onPress={navigation.goBack}
          >
            <BackIcon {...headerIconColors} height={44} width={44} />
          </SuccessBackButton>
        </SuccessHeader>
        <SuccessContent accessibilityLiveRegion="polite">
          <SuccessIconSurface testID="v2-reservation-success-icon">
            <PendingReservationIcon height={50} width={44} />
          </SuccessIconSurface>
          <SuccessTitle>{t('reservation.create.successTitle')}</SuccessTitle>
          <SuccessDescription>{t('reservation.create.successDescription')}</SuccessDescription>
          <SuccessSummary accessibilityRole="summary">
            <SuccessRow>
              <SuccessRowLabel>{t('reservation.create.selectedWindow')}</SuccessRowLabel>
              <SuccessRowValue testID="v2-reservation-success-window">
                {createdWindow ?? t('reservation.create.windowPending')}
              </SuccessRowValue>
            </SuccessRow>
            {createdBookerName ? (
              <SuccessRow>
                <SuccessRowLabel>{t('reservation.detail.bookerName')}</SuccessRowLabel>
                <SuccessRowValue>{createdBookerName}</SuccessRowValue>
              </SuccessRow>
            ) : null}
          </SuccessSummary>
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
        <BackButton accessibilityLabel={t('reservation.common.back')} accessibilityRole="button" onPress={navigation.goBack}><BackIcon {...headerIconColors} width={44} height={44} /></BackButton>
        <HeaderTitle>{t('reservation.create.title')}</HeaderTitle><HeaderSpacer />
      </Header>
      <Form keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <PlaceSummary>
          {route.params.imageUrl ? <Thumbnail source={{ uri: route.params.imageUrl }} testID="v2-reservation-place-image" /> : <ThumbnailFallback><ThumbnailFallbackText>⌂</ThumbnailFallbackText></ThumbnailFallback>}
          <PlaceCopy>
            <PlaceMeta>{t('reservation.create.peopleRange', { category: route.params.category ?? detail.data?.touristCategories?.[0] ?? '' })}</PlaceMeta>
            <PlaceName numberOfLines={1}>{route.params.placeName ?? detail.data?.name ?? t('reservation.create.loadingPlace')}</PlaceName>
          </PlaceCopy><Chevron>›</Chevron>
        </PlaceSummary>

        <PeopleSection><SectionTitle>{t('reservation.create.people')}</SectionTitle>
          <Horizontal horizontal showsHorizontalScrollIndicator={false}>
            {PEOPLE.map((count) => <Choice key={count} $selected={quantity === count} accessibilityRole="button" accessibilityState={{ selected: quantity === count }} onPress={() => selectQuantity(count)}><ChoiceText $selected={quantity === count}>{t('reservation.create.peopleCount', { count })}</ChoiceText></Choice>)}
          </Horizontal>
        </PeopleSection>

        <Section><SectionTitle>{t('reservation.create.date')}</SectionTitle>
          <Calendar>
            <MonthRow><MonthButton accessibilityLabel={t('reservation.create.previousMonth')} accessibilityRole="button" onPress={() => moveMonth(-1)}><MonthButtonText>‹</MonthButtonText></MonthButton><MonthTitle testID="v2-reservation-month">{new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric' }).format(month)}</MonthTitle><MonthButton accessibilityLabel={t('reservation.create.nextMonth')} accessibilityRole="button" onPress={() => moveMonth(1)}><MonthButtonText>›</MonthButtonText></MonthButton></MonthRow>
            <WeekRow>{WEEKDAY_KEYS.map((day, weekday) => <Weekday $weekday={weekday} key={day}>{t(`reservation.create.weekdays.${day}`)}</Weekday>)}</WeekRow>
            <CalendarGrid {...dateDrag.gridHandlers} testID="v2-reservation-calendar-grid">{buildLocalCalendar(month).map((date, index) => date ? (() => {
              const key = localDateKey(date);
              const selected = key === (dateDrag.endpoint ?? selectedDate);
              const isPast = startOfLocalDay(date).getTime() < startOfLocalDay(now).getTime();
              const available = !isPast && availableDates.has(key);
              // Keep today's completed slots inspectable for their unavailable reason,
              // but dates before today must not remain interactive just because the
              // server still returns historical availability records.
              const scheduled = !isPast && scheduledDates.has(key);
              const remainingCapacity = isPast ? undefined : remainingCapacityByDate.get(key);
              const dateLabel = remainingCapacity !== undefined
                ? t('reservation.create.availableDateCapacityLabel', {
                  count: remainingCapacity,
                  date: key,
                })
                : available
                  ? t('reservation.create.availableDateLabel', { date: key })
                : scheduled
                  ? t('reservation.create.scheduledDateLabel', { date: key })
                  : t('reservation.create.unavailableDateLabel', { date: key });
              const selectedAndAvailable = selected && available;
              return <DayCell key={key}><DayButton $selected={selectedAndAvailable} accessibilityLabel={dateLabel} accessibilityRole="button" accessibilityState={{ disabled: !scheduled, selected }} disabled={!scheduled} {...dateDrag.dayProps(key, !scheduled)}><DayText $available={available} $selected={selectedAndAvailable} $weekday={date.getDay()}>{date.getDate()}</DayText>{remainingCapacity !== undefined ? <DayCapacity $selected={selectedAndAvailable} testID={`v2-reservation-date-capacity-${key}`}>{remainingCapacity}</DayCapacity> : null}</DayButton></DayCell>;
            })() : <DayCell key={`blank-${index}`} />)}</CalendarGrid>
          </Calendar>
        </Section>

        <Section><SectionTitle>{t('reservation.create.time')}</SectionTitle>
          {availabilities.isError ? <ApiErrorState error={availabilities.error} busy={availabilities.isFetching} onRetry={() => availabilities.refetch({ cancelRefetch: false })} /> : null}
          <ReservationAvailabilitySlots
            availabilityData={availabilityData}
            bookableCount={bookableCount}
            isError={availabilities.isError && !availabilities.data}
            isPending={availabilities.isPending}
            language={i18n.language}
            now={now}
            onChangeTimePeriod={setTimePeriod}
            onSelectAvailability={selectAvailability}
            placeName={route.params.placeName ?? detail.data?.name ?? t('reservation.create.loadingPlace')}
            quantity={quantity}
            selectedAvailabilityId={selectedAvailabilityId}
            selectedDate={selectedDate}
            selectedDateSlots={selectedDateSlots}
            summary={availabilitySummary}
            t={t}
            timePeriod={timePeriod}
          />
        </Section>

        <SubmitSection>
          <SectionTitle>{t('reservation.create.booker.title')}</SectionTitle>
          <Field>
            <FieldLabel>{t('reservation.create.booker.name')}</FieldLabel>
            <FieldInput
              accessibilityHint={bookerErrorKeyFor('bookerName') ? t(bookerErrorKeyFor('bookerName') as string) : undefined}
              accessibilityLabel={t('reservation.create.booker.name')}
              autoCapitalize="words"
              maxLength={BOOKER_NAME_MAX_LENGTH}
              onBlur={() => setShowBookerErrors(true)}
              onChangeText={(value) => { beginNewReservationIntent(); setBookerName(value); }}
              placeholder={t('reservation.create.booker.namePlaceholder')}
              placeholderTextColor={theme.colors.textMuted}
              testID="v2-booker-name"
              value={bookerName}
            />
            {bookerErrorKeyFor('bookerName') ? (
              <FieldError accessibilityLiveRegion="polite" accessibilityRole="alert" testID="v2-booker-name-error">
                {t(bookerErrorKeyFor('bookerName') as string)}
              </FieldError>
            ) : null}
          </Field>
          <Field>
            <FieldLabel>{t('reservation.create.booker.phone')}</FieldLabel>
            <FieldInput
              accessibilityHint={bookerErrorKeyFor('bookerPhone') ? t(bookerErrorKeyFor('bookerPhone') as string) : undefined}
              accessibilityLabel={t('reservation.create.booker.phone')}
              autoComplete="tel"
              keyboardType="phone-pad"
              maxLength={BOOKER_PHONE_MAX_LENGTH}
              onBlur={() => setShowBookerErrors(true)}
              onChangeText={(value) => { beginNewReservationIntent(); setBookerPhone(value); }}
              placeholder={t('reservation.create.booker.phonePlaceholder')}
              placeholderTextColor={theme.colors.textMuted}
              testID="v2-booker-phone"
              value={bookerPhone}
            />
            {bookerErrorKeyFor('bookerPhone') ? (
              <FieldError accessibilityLiveRegion="polite" accessibilityRole="alert" testID="v2-booker-phone-error">
                {t(bookerErrorKeyFor('bookerPhone') as string)}
              </FieldError>
            ) : null}
          </Field>
          <Field>
            <FieldLabel>
              {t('reservation.create.booker.note')}
              <FieldHint>{`  ${t('reservation.create.booker.noteOptional')}`}</FieldHint>
            </FieldLabel>
            <NoteInput
              accessibilityHint={bookerErrorKeyFor('requestNote') ? t(bookerErrorKeyFor('requestNote') as string) : undefined}
              accessibilityLabel={t('reservation.create.booker.note')}
              maxLength={REQUEST_NOTE_MAX_LENGTH}
              multiline
              onBlur={() => setShowBookerErrors(true)}
              onChangeText={(value) => { beginNewReservationIntent(); setRequestNote(value); }}
              placeholder={t('reservation.create.booker.notePlaceholder')}
              placeholderTextColor={theme.colors.textMuted}
              testID="v2-booker-note"
              textAlignVertical="top"
              value={requestNote}
            />
            <FieldHint>{`${requestNote.length}/${REQUEST_NOTE_MAX_LENGTH}`}</FieldHint>
            {bookerErrorKeyFor('requestNote') ? (
              <FieldError accessibilityLiveRegion="polite" accessibilityRole="alert" testID="v2-booker-note-error">
                {t(bookerErrorKeyFor('requestNote') as string)}
              </FieldError>
            ) : null}
          </Field>
        </SubmitSection>

        <Section>
          {submitErrorKey ? (
            <ErrorText accessibilityLiveRegion="polite" accessibilityRole="alert">{t(submitErrorKey)}</ErrorText>
          ) : null}
          {submitErrorKey === 'reservation.create.submitNetworkError' && navigation.navigate ? (
            <Button label={t('reservation.box.title')} onPress={() => navigation.navigate?.('ReservationBox')} />
          ) : null}
          <SubmitButton $enabled={canSubmit} accessibilityRole="button" accessibilityState={{ disabled: !slotReady, busy: createReservation.isPending || isSubmitting }} disabled={!slotReady} onPress={submit} testID="v2-reservation-submit">
            {createReservation.isPending || isSubmitting ? <ActivityIndicator color={theme.colors.onPrimary} /> : <SubmitLabel $enabled={canSubmit}>{t('reservation.create.submit')}</SubmitLabel>}
          </SubmitButton>
        </Section>
      </Form>
    </Screen>
  );
}


const Screen = styled(SafeAreaView)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
const Header = styled.View`height: 64px; flex-direction: row; align-items: center; padding: 0 ${({ theme }) => theme.spacing.md}px; border-bottom-width: 1px; border-bottom-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const BackButton = styled.Pressable`width: 44px; height: 44px; align-items: center; justify-content: center;`;
const HeaderTitle = styled(AppText)`flex: 1; color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.body.fontSize}px; font-weight: ${({ theme }) => theme.typography.title.fontWeight}; text-align: center;`;
const HeaderSpacer = styled.View`width: 44px;`;
const Form = styled(CalendarScrollView)`flex: 1;`;
const PlaceSummary = styled.View`flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.md}px; margin: ${({ theme }) => theme.spacing.md}px; padding: ${({ theme }) => theme.spacing.sm}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const Thumbnail = styled.Image`width: 48px; height: 48px; border-radius: ${({ theme }) => theme.radius.sm}px;`;
const ThumbnailFallback = styled.View`width: 48px; height: 48px; align-items: center; justify-content: center; border-radius: ${({ theme }) => theme.radius.sm}px; background-color: ${({ theme }) => theme.colors.border};`;
const ThumbnailFallbackText = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.title.fontSize}px;`;
const PlaceCopy = styled.View`flex: 1; gap: 2px;`;
const PlaceMeta = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; font-size: 12px;`;
const PlaceName = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.body.fontSize}px; font-weight: ${({ theme }) => theme.typography.title.fontWeight};`;
const Chevron = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; font-size: 28px;`;
const Section = styled.View`gap: ${({ theme }) => theme.spacing.sm}px; padding: ${({ theme }) => theme.spacing.md}px; border-top-width: 8px; border-top-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const PeopleSection = styled.View`gap: ${({ theme }) => theme.spacing.sm}px; padding: 0 ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.md}px;`;
const SubmitSection = styled.View`gap: ${({ theme }) => theme.spacing.sm}px; padding: 0 ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;`;
const SectionTitle = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.label.fontSize}px; font-weight: ${({ theme }) => theme.typography.title.fontWeight};`;
const Horizontal = styled.ScrollView`flex-grow: 0;`;
const Choice = styled.Pressable<{ $selected: boolean }>`min-width: 48px; height: 34px; align-items: center; justify-content: center; margin-right: ${({ theme }) => theme.spacing.sm}px; padding: 0 12px; border-width: 1px; border-color: ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.surfaceMuted}; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ $selected, theme }) => $selected ? theme.colors.primarySoft : theme.colors.surfaceMuted};`;
const ChoiceText = styled(AppText)<{ $selected: boolean }>`color: ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const Calendar = styled.View`padding: ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.lg}px; background-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const MonthRow = styled.View`flex-direction: row; align-items: center; justify-content: center;`;
const MonthButton = styled.Pressable`width: 36px; height: 36px; align-items: center; justify-content: center;`;
const MonthButtonText = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.title.fontSize}px;`;
const MonthTitle = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.body.fontSize}px; font-weight: ${({ theme }) => theme.typography.title.fontWeight};`;
const WeekRow = styled.View`flex-direction: row; margin-top: ${({ theme }) => theme.spacing.sm}px;`;
const Weekday = styled(AppText)<{ $weekday: number }>`width: 14.285%; color: ${({ $weekday, theme }) => $weekday === 0 ? theme.colors.calendarSunday : $weekday === 6 ? theme.colors.calendarSaturday : theme.colors.text}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; text-align: center;`;
const CalendarGrid = styled.View`flex-direction: row; flex-wrap: wrap; margin-top: ${({ theme }) => theme.spacing.xs}px;`;
const DayCell = styled.View`width: 14.285%; height: 44px; align-items: center; justify-content: center;`;
const DayButton = styled.Pressable<{ $selected: boolean }>`width: 44px; height: 44px; align-items: center; justify-content: center; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ $selected, theme }) => $selected ? theme.colors.primaryAction : 'transparent'};`;
const DayText = styled(AppText)<{ $available: boolean; $selected: boolean; $weekday: number }>`color: ${({ $available, $selected, $weekday, theme }) => $selected ? theme.colors.onPrimary : !$available ? theme.colors.disabled : $weekday === 0 ? theme.colors.calendarSunday : $weekday === 6 ? theme.colors.calendarSaturday : theme.colors.text}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; font-weight: ${({ $available, $selected }) => $available || $selected ? '700' : '400'};`;
const DayCapacity = styled(AppText)<{ $selected: boolean }>`color: ${({ $selected, theme }) => $selected ? theme.colors.onPrimary : theme.colors.textMuted}; font-size: 9px; line-height: 10px;`;
const RetryButton = styled.Pressable`padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.primarySoft};`;
const RetryText = styled(AppText)`color: ${({ theme }) => theme.colors.primary}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; font-weight: ${({ theme }) => theme.typography.label.fontWeight};`;
const Field = styled.View`gap: 2px;`;
const FieldLabel = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; font-size: 12px;`;
const FieldInput = styled(AppTextInput)`height: 46px; padding: 0; border-bottom-width: 1px; border-bottom-color: ${({ theme }) => theme.colors.border}; color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.typography.body.fontSize}px;`;
const NoteInput = styled(AppTextInput)`min-height: 96px; margin-top: 6px; padding: ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.inputBackground}; color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.typography.body.fontSize}px;`;
const FieldHint = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const FieldError = styled(AppText)`color: ${({ theme }) => theme.colors.danger}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const ErrorText = styled(AppText)`color: ${({ theme }) => theme.colors.danger}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; text-align: center;`;
const SubmitButton = styled.Pressable<{ $enabled: boolean }>`height: 56px; align-items: center; justify-content: center; margin-top: ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ $enabled, theme }) => $enabled ? theme.colors.primaryAction : theme.colors.disabled};`;
const SubmitLabel = styled(AppText)<{ $enabled: boolean }>`color: ${({ $enabled, theme }) => $enabled ? theme.colors.onPrimary : theme.colors.onDisabled}; font-size: ${({ theme }) => theme.typography.body.fontSize}px; font-weight: ${({ theme }) => theme.typography.label.fontWeight};`;
const SuccessHeader = styled.View`height: 72px; justify-content: center; padding: 0 ${({ theme }) => theme.spacing.lg}px;`;
const SuccessBackButton = styled.Pressable`width: 56px; height: 56px; align-items: center; justify-content: center; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.surface}; shadow-color: ${({ theme }) => theme.colors.shadow}; shadow-offset: 0 8px; shadow-opacity: 0.06; shadow-radius: 20px; elevation: 3;`;
const SuccessContent = styled.View`flex: 1; align-items: center; justify-content: center; gap: ${({ theme }) => theme.spacing.md}px; padding: 0 ${({ theme }) => theme.spacing.lg}px;`;
const SuccessIconSurface = styled.View`width: 96px; height: 96px; align-items: center; justify-content: center; margin-bottom: ${({ theme }) => theme.spacing.sm}px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.primarySoft};`;
const SuccessTitle = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.title.fontSize}px; font-weight: ${({ theme }) => theme.typography.title.fontWeight}; line-height: ${({ theme }) => theme.typography.title.lineHeight}px; text-align: center;`;
const SuccessDescription = styled(AppText)`color: ${({ theme }) => theme.colors.textAlternative}; font-size: ${({ theme }) => theme.typography.body.fontSize}px; line-height: ${({ theme }) => theme.typography.body.lineHeight}px; text-align: center;`;
const SuccessFooter = styled.View`padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.lg}px;`;
const SuccessAction = styled.Pressable`height: 64px; align-items: center; justify-content: center; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.primaryAction};`;
const SuccessActionLabel = styled(AppText)`color: ${({ theme }) => theme.colors.onPrimary}; font-size: ${({ theme }) => theme.typography.onboardingAction.fontSize}px; font-weight: ${({ theme }) => theme.typography.onboardingAction.fontWeight}; line-height: ${({ theme }) => theme.typography.onboardingAction.lineHeight}px;`;
const SuccessSummary = styled.View`align-self: stretch; gap: ${({ theme }) => theme.spacing.sm}px; padding: ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const SuccessRow = styled.View`gap: ${({ theme }) => theme.spacing.xs}px;`;
const SuccessRowLabel = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const SuccessRowValue = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.body.fontSize}px; font-weight: ${({ theme }) => theme.typography.label.fontWeight};`;
