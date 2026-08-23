import React, { useMemo, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import { usePlaceDetail } from '../../place-detail/hooks/usePlaceDetail';
import { useAvailabilities, useCreateReservation } from '../hooks/useReservations';

const PEOPLE = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;
const FALLBACK_MONTH = new Date(2026, 6, 1);
const FALLBACK_DATE = new Date(2026, 6, 10);
const FALLBACK_TIMES = {
  am: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
  pm: ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30'],
} as const;

type CreateReservationScreenProps = {
  navigation: { goBack: () => void };
  route: { params: { category?: string; imageUrl?: string; placeId: number; placeName?: string } };
};

export default function CreateReservationScreen({ navigation, route }: CreateReservationScreenProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [month, setMonth] = useState(FALLBACK_MONTH);
  const [quantity, setQuantity] = useState(2);
  const [selectedDate, setSelectedDate] = useState(() => dateKey(FALLBACK_DATE));
  const [selectedAvailabilityId, setSelectedAvailabilityId] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'am' | 'pm'>('pm');
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [request, setRequest] = useState('');
  const detail = usePlaceDetail(route.params.placeId);
  const range = useMemo(() => ({
    fromAt: startOfMonth(month).toISOString(),
    toAt: startOfMonth(addMonths(month, 1)).toISOString(),
  }), [month]);
  const availabilities = useAvailabilities(route.params.placeId, range);
  const createReservation = useCreateReservation();
  const activeAvailabilities = (availabilities.data ?? []).filter((item) =>
    item.status === 'ACTIVE' && item.remainingCapacity >= quantity);
  const availableDates = new Set(activeAvailabilities.map((item) => dateKey(new Date(item.startsAt))));
  const timeSlots = activeAvailabilities.filter((item) => dateKey(new Date(item.startsAt)) === selectedDate);
  const periodSlots = timeSlots.filter((item) => {
    const hour = new Date(item.startsAt).getHours();
    return selectedPeriod === 'am' ? hour < 12 : hour >= 12;
  });
  const visibleTimes = periodSlots.length
    ? periodSlots.map((slot) => ({ id: slot.id, label: formatTime(slot.startsAt) }))
    : FALLBACK_TIMES[selectedPeriod].map((label) => ({ id: null, label }));
  const canSubmit = Boolean(selectedAvailabilityId && name.trim() && phone.trim());

  const moveMonth = (offset: number) => {
    const nextMonth = addMonths(month, offset);
    setMonth(nextMonth);
    setSelectedDate(dateKey(startOfMonth(nextMonth)));
    setSelectedAvailabilityId(null);
  };

  const submit = () => {
    if (!selectedAvailabilityId) return;
    createReservation.mutate({ availabilityId: selectedAvailabilityId, quantity });
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
        <BackButton accessibilityLabel={t('reservation.common.back')} accessibilityRole="button" onPress={navigation.goBack}><BackText>‹</BackText></BackButton>
        <HeaderTitle>{t('reservation.create.title')}</HeaderTitle><HeaderSpacer />
      </Header>
      <Form keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <PlaceSummary>
          {route.params.imageUrl || detail.data?.thumbnailUrl ? <Thumbnail source={{ uri: route.params.imageUrl ?? detail.data?.thumbnailUrl ?? '' }} testID="v2-reservation-place-image" /> : <ThumbnailFallback><ThumbnailFallbackText>⌂</ThumbnailFallbackText></ThumbnailFallback>}
          <PlaceCopy>
            <Helper>{t('reservation.create.peopleRange', { category: route.params.category ?? detail.data?.category ?? '' })}</Helper>
            <PlaceName numberOfLines={1}>{route.params.placeName ?? detail.data?.name ?? t('reservation.create.loadingPlace')}</PlaceName>
          </PlaceCopy><Chevron>›</Chevron>
        </PlaceSummary>

        <Section><SectionTitle>{t('reservation.create.people')}</SectionTitle>
          <Horizontal horizontal showsHorizontalScrollIndicator={false}>
            {PEOPLE.map((count) => <Choice key={count} $selected={quantity === count} accessibilityRole="button" accessibilityState={{ selected: quantity === count }} onPress={() => { setQuantity(count); setSelectedAvailabilityId(null); }}><ChoiceText $selected={quantity === count}>{t('reservation.create.peopleCount', { count })}</ChoiceText></Choice>)}
          </Horizontal>
        </Section>

        <Section><SectionTitle>{t('reservation.create.date')}</SectionTitle>
          <Calendar>
            <MonthRow><MonthButton accessibilityRole="button" onPress={() => moveMonth(-1)}><MonthButtonText>‹</MonthButtonText></MonthButton><MonthTitle>{new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric' }).format(month)}</MonthTitle><MonthButton accessibilityRole="button" onPress={() => moveMonth(1)}><MonthButtonText>›</MonthButtonText></MonthButton></MonthRow>
            <WeekRow>{WEEKDAYS.map((day, index) => <Weekday key={`${day}-${index}`}>{day}</Weekday>)}</WeekRow>
            <CalendarGrid>{buildCalendar(month).map((date, index) => date ? (() => {
              const key = dateKey(date); const selected = key === selectedDate; const available = availableDates.has(key);
              return <DayCell key={key}><DayButton $selected={selected} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => { setSelectedDate(key); setSelectedAvailabilityId(null); }}><DayText $available={available} $selected={selected} $saturday={date.getDay() === 6} $sunday={date.getDay() === 0}>{date.getDate()}</DayText></DayButton></DayCell>;
            })() : <DayCell key={`blank-${index}`} />)}</CalendarGrid>
          </Calendar>
        </Section>

        <Section><SectionTitle>{t('reservation.create.time')}</SectionTitle>
          <PeriodTabs>
            {(['am', 'pm'] as const).map((period) => <PeriodTab key={period} $selected={selectedPeriod === period} accessibilityRole="tab" accessibilityState={{ selected: selectedPeriod === period }} onPress={() => { setSelectedPeriod(period); setSelectedTime(FALLBACK_TIMES[period][0]); setSelectedAvailabilityId(null); }}><PeriodText $selected={selectedPeriod === period}>{t(`reservation.create.period.${period}`)}</PeriodText></PeriodTab>)}
          </PeriodTabs>
          {availabilities.isPending ? <ActivityIndicator color={theme.colors.primary} /> : <Horizontal horizontal showsHorizontalScrollIndicator={false}>
            {visibleTimes.map((slot) => { const selected = selectedTime === slot.label; return <Choice key={slot.label} $selected={selected} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => { setSelectedTime(slot.label); setSelectedAvailabilityId(slot.id); }}><ChoiceText $selected={selected}>{slot.label}</ChoiceText></Choice>; })}
          </Horizontal>}
        </Section>

        <Section><SectionTitle>{t('reservation.create.guest')}</SectionTitle>
          <FieldLabel>{t('reservation.create.name')}</FieldLabel><LineInput onChangeText={setName} placeholder={t('reservation.create.namePlaceholder')} placeholderTextColor={theme.colors.textMuted} value={name} />
          <FieldLabel>{t('reservation.create.phone')}</FieldLabel><LineInput keyboardType="phone-pad" onChangeText={setPhone} placeholder={t('reservation.create.phonePlaceholder')} placeholderTextColor={theme.colors.textMuted} value={phone} />
          <FieldLabel>{t('reservation.create.request')}</FieldLabel><RequestInput multiline onChangeText={setRequest} placeholder={t('reservation.create.requestPlaceholder')} placeholderTextColor={theme.colors.textMuted} textAlignVertical="top" value={request} />
          {createReservation.isError ? <ErrorText>{t('reservation.create.submitError')}</ErrorText> : null}
          <SubmitButton $enabled={canSubmit} accessibilityRole="button" accessibilityState={{ disabled: !canSubmit, busy: createReservation.isPending }} disabled={!canSubmit || createReservation.isPending} onPress={submit} testID="v2-reservation-submit">
            {createReservation.isPending ? <ActivityIndicator color={theme.colors.onPrimary} /> : <SubmitLabel $enabled={canSubmit}>{t('reservation.create.submit')}</SubmitLabel>}
          </SubmitButton>
        </Section>
      </Form>
    </Screen>
  );
}

function startOfDay(date: Date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
function startOfMonth(date: Date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
function addMonths(date: Date, offset: number) { return new Date(date.getFullYear(), date.getMonth() + offset, 1); }
function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function buildCalendar(month: Date): Array<Date | null> { const first = startOfMonth(month); const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate(); return [...Array(first.getDay()).fill(null), ...Array.from({ length: days }, (_, index) => new Date(first.getFullYear(), first.getMonth(), index + 1))]; }
function formatTime(value: string) { return new Intl.DateTimeFormat(undefined, { hour: '2-digit', hour12: false, minute: '2-digit' }).format(new Date(value)); }

const Screen = styled(SafeAreaView)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
const Header = styled.View`height: 64px; flex-direction: row; align-items: center; padding: 0 ${({ theme }) => theme.spacing.md}px; border-bottom-width: 1px; border-bottom-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const BackButton = styled.Pressable`width: 42px; height: 42px; align-items: center; justify-content: center; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const BackText = styled.Text`color: ${({ theme }) => theme.colors.textMuted}; font-size: 30px; line-height: 32px;`;
const HeaderTitle = styled.Text`flex: 1; color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.body.fontSize}px; font-weight: ${({ theme }) => theme.typography.title.fontWeight}; text-align: center;`;
const HeaderSpacer = styled.View`width: 42px;`;
const Form = styled.ScrollView`flex: 1;`;
const PlaceSummary = styled.View`flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.md}px; margin: ${({ theme }) => theme.spacing.md}px; padding: ${({ theme }) => theme.spacing.sm}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const Thumbnail = styled.Image`width: 48px; height: 48px; border-radius: ${({ theme }) => theme.radius.sm}px;`;
const ThumbnailFallback = styled.View`width: 48px; height: 48px; align-items: center; justify-content: center; border-radius: ${({ theme }) => theme.radius.sm}px; background-color: ${({ theme }) => theme.colors.border}; color: ${({ theme }) => theme.colors.textMuted};`;
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
const MonthButton = styled.Pressable`width: 36px; height: 36px; align-items: center; justify-content: center; color: ${({ theme }) => theme.colors.textMuted};`;
const MonthButtonText = styled.Text`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.title.fontSize}px;`;
const MonthTitle = styled.Text`color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.body.fontSize}px; font-weight: ${({ theme }) => theme.typography.title.fontWeight};`;
const WeekRow = styled.View`flex-direction: row; margin-top: ${({ theme }) => theme.spacing.sm}px;`;
const Weekday = styled.Text`width: 14.285%; color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; text-align: center;`;
const CalendarGrid = styled.View`flex-direction: row; flex-wrap: wrap; margin-top: ${({ theme }) => theme.spacing.xs}px;`;
const DayCell = styled.View`width: 14.285%; height: 46px; align-items: center; justify-content: center;`;
const DayButton = styled.Pressable<{ $selected: boolean }>`width: 42px; height: 42px; align-items: center; justify-content: center; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ $selected, theme }) => $selected ? theme.colors.primary : 'transparent'};`;
const DayText = styled.Text<{ $available: boolean; $saturday: boolean; $selected: boolean; $sunday: boolean }>`color: ${({ $available, $saturday, $selected, $sunday, theme }) => $selected ? theme.colors.onPrimary : $available ? theme.colors.focus : $sunday ? theme.colors.danger : $saturday ? '#168CFF' : theme.colors.text}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; font-weight: ${({ $available, $selected }) => $available || $selected ? '700' : '400'};`;
const PeriodTabs = styled.View`height: 38px; flex-direction: row; align-items: flex-end; border-bottom-width: 1px; border-bottom-color: ${({ theme }) => theme.colors.border};`;
const PeriodTab = styled.Pressable<{ $selected: boolean }>`height: 38px; justify-content: center; margin-right: ${({ theme }) => theme.spacing.lg}px; padding: 0 ${({ theme }) => theme.spacing.sm}px; border-bottom-width: 2px; border-bottom-color: ${({ $selected, theme }) => $selected ? theme.colors.primary : 'transparent'};`;
const PeriodText = styled.Text<{ $selected: boolean }>`color: ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.body.fontSize}px;`;
const FieldLabel = styled.Text`margin-top: ${({ theme }) => theme.spacing.sm}px; color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const LineInput = styled.TextInput`height: 42px; padding: 0; border-bottom-width: 1px; border-bottom-color: ${({ theme }) => theme.colors.border}; color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.body.fontSize}px;`;
const RequestInput = styled.TextInput`height: 120px; padding: ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.surfaceMuted}; color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const Helper = styled.Text`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const ErrorText = styled.Text`color: ${({ theme }) => theme.colors.danger}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const SubmitButton = styled.Pressable<{ $enabled: boolean }>`height: 56px; align-items: center; justify-content: center; margin-top: ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ $enabled, theme }) => $enabled ? theme.colors.primary : theme.colors.disabled};`;
const SubmitLabel = styled.Text<{ $enabled: boolean }>`color: ${({ $enabled, theme }) => $enabled ? theme.colors.onPrimary : theme.colors.onDisabled}; font-size: ${({ theme }) => theme.typography.body.fontSize}px; font-weight: ${({ theme }) => theme.typography.label.fontWeight};`;
const SuccessContent = styled.View`flex: 1; align-items: center; justify-content: center; gap: ${({ theme }) => theme.spacing.md}px; padding: ${({ theme }) => theme.spacing.lg}px;`;
const SuccessMark = styled.Text`width: 64px; height: 64px; color: ${({ theme }) => theme.colors.onPrimary}; background-color: ${({ theme }) => theme.colors.success}; border-radius: ${({ theme }) => theme.radius.full}px; font-size: 36px; line-height: 60px; text-align: center;`;
const SuccessTitle = styled.Text`color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.title.fontSize}px; font-weight: ${({ theme }) => theme.typography.title.fontWeight};`;
