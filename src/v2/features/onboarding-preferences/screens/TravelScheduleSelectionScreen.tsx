import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import Button from '../../../shared/components/Button';
import OnboardingProgressHeader from '../components/OnboardingProgressHeader';
import {
  isServerTravelDate,
  type ServerTravelDate,
  type TravelDateInput,
} from '../model/onboardingPreference';
import {
  buildCalendarDays,
  formatAccessibleTravelDate,
  formatCalendarMonth,
  formatDisplayTravelDate,
  getInitialCalendarMonth,
  getTravelScheduleSelectionState,
  selectTravelDate,
  shiftCalendarMonth,
} from '../model/travelScheduleCalendar';

const DEFAULT_CURRENT_STEP = 7;
const DEFAULT_TOTAL_STEPS = 7;
const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

export type TravelScheduleSelectionScreenProps = Readonly<{
  currentStep?: number;
  errorMessage?: string | null;
  isContinuing?: boolean;
  onBack: () => void;
  onChange: (selectedSchedule: TravelDateInput) => void;
  onContinue: () => void;
  selectedSchedule: TravelDateInput;
  totalSteps?: number;
}>;

export default function TravelScheduleSelectionScreen({
  currentStep = DEFAULT_CURRENT_STEP,
  errorMessage = null,
  isContinuing = false,
  onBack,
  onChange,
  onContinue,
  selectedSchedule,
  totalSteps = DEFAULT_TOTAL_STEPS,
}: TravelScheduleSelectionScreenProps) {
  const { i18n, t } = useTranslation();
  const [visibleMonth, setVisibleMonth] = useState(() =>
    getInitialCalendarMonth(selectedSchedule));
  const selectionState = getTravelScheduleSelectionState(selectedSchedule);
  const calendarDays = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
  const validRange = selectionState.kind === 'complete' ? selectionState.range : null;
  const validStart = selectionState.kind === 'start-only'
    ? selectionState.startDate
    : validRange?.startDate;
  const validEnd = validRange?.endDate;
  const canContinue = selectionState.kind === 'complete';

  const handleDatePress = (date: ServerTravelDate) => {
    onChange(selectTravelDate(selectedSchedule, date));
  };

  const renderDateValue = (value: string) => isServerTravelDate(value)
    ? formatDisplayTravelDate(value)
    : t('onboarding.travelScheduleScreen.emptyDate');

  return (
    <Screen edges={['right', 'left']} testID="travel-schedule-screen">
      <OnboardingProgressHeader
        backLabel={t('onboarding.travelScheduleScreen.back')}
        currentStep={currentStep}
        onBack={onBack}
        progressLabel={t('onboarding.travelScheduleScreen.progress')}
        progressValueText={t('onboarding.travelScheduleScreen.progressValue', {
          current: currentStep,
          total: totalSteps,
        })}
        totalSteps={totalSteps}
      />

      <ContentScroll
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        testID="travel-schedule-scroll-view"
      >
        <Content>
          <Heading>
            <Title>{t('onboarding.travelScheduleScreen.title')}</Title>
            <Description>{t('onboarding.travelScheduleScreen.description')}</Description>
          </Heading>

          <DateSummary>
            <DateCard>
              <DateLabel>{t('onboarding.travelScheduleScreen.startDate')}</DateLabel>
              <DateValue $hasValue={isServerTravelDate(selectedSchedule.startDateText)}>
                {renderDateValue(selectedSchedule.startDateText)}
              </DateValue>
            </DateCard>
            <DateCard>
              <DateLabel>{t('onboarding.travelScheduleScreen.endDate')}</DateLabel>
              <DateValue $hasValue={isServerTravelDate(selectedSchedule.endDateText)}>
                {renderDateValue(selectedSchedule.endDateText)}
              </DateValue>
            </DateCard>
          </DateSummary>

          {selectionState.kind === 'invalid' ? (
            <SelectionMessage accessibilityLiveRegion="polite" $error>
              {t('onboarding.travelScheduleScreen.invalidRange')}
            </SelectionMessage>
          ) : (
            <SelectionMessage accessibilityLiveRegion="polite" $error={false}>
              {t('onboarding.travelScheduleScreen.selectEndDate')}
            </SelectionMessage>
          )}

          {errorMessage ? (
            <SelectionMessage
              accessibilityLiveRegion="polite"
              $error
              testID="travel-schedule-error"
            >
              {errorMessage}
            </SelectionMessage>
          ) : null}

          <Calendar accessibilityLabel={t('onboarding.travelScheduleScreen.calendar')}>
            <MonthHeader>
              <MonthButton
                accessibilityLabel={t('onboarding.travelScheduleScreen.previousMonth')}
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setVisibleMonth((month) => shiftCalendarMonth(month, -1))}
              >
                <MonthArrow aria-hidden>‹</MonthArrow>
              </MonthButton>
              <MonthTitle accessibilityRole="header">
                {formatCalendarMonth(visibleMonth, i18n.language)}
              </MonthTitle>
              <MonthButton
                accessibilityLabel={t('onboarding.travelScheduleScreen.nextMonth')}
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setVisibleMonth((month) => shiftCalendarMonth(month, 1))}
              >
                <MonthArrow aria-hidden>›</MonthArrow>
              </MonthButton>
            </MonthHeader>

            <WeekdayRow accessibilityRole="header">
              {WEEKDAY_KEYS.map((weekday, index) => (
                <Weekday key={weekday} $weekday={index}>
                  {t(`onboarding.travelScheduleScreen.weekdays.${weekday}`)}
                </Weekday>
              ))}
            </WeekdayRow>

            <CalendarGrid>
              {calendarDays.map((calendarDay, index) => {
                if (!calendarDay) {
                  return <EmptyDay key={`empty-${index}`} />;
                }

                const { date, day, weekday } = calendarDay;
                const selected = date === validStart || date === validEnd;
                const inRange = Boolean(validRange
                  && date >= validRange.startDate
                  && date <= validRange.endDate);
                const disabled = selectionState.kind === 'start-only'
                  && date < selectionState.startDate;
                const roundedLeft = inRange && (date === validStart || weekday === 0);
                const roundedRight = inRange && (date === validEnd || weekday === 6);

                return (
                  <DayCell
                    key={date}
                    $inRange={inRange}
                    $roundedLeft={roundedLeft}
                    $roundedRight={roundedRight}
                  >
                    <DayButton
                      $selected={selected}
                      accessibilityLabel={formatAccessibleTravelDate(date, i18n.language)}
                      accessibilityRole="button"
                      accessibilityState={{ disabled, selected }}
                      disabled={disabled}
                      onPress={() => handleDatePress(date)}
                      testID={`travel-schedule-day-${date}`}
                    >
                      <DayText
                        $disabled={disabled}
                        $inRange={inRange}
                        $selected={selected}
                        $weekday={weekday}
                      >
                        {day}
                      </DayText>
                    </DayButton>
                  </DayCell>
                );
              })}
            </CalendarGrid>
          </Calendar>
        </Content>
      </ContentScroll>

      <Footer>
        <Button
          disabled={!canContinue}
          fullWidth
          label={t('onboarding.travelScheduleScreen.continue')}
          loading={isContinuing}
          onPress={onContinue}
          shape="rounded"
          size="onboarding"
        />
      </Footer>
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ContentScroll = styled.ScrollView`
  flex: 1;
`;

const Content = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
`;

const Heading = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

const Title = styled.Text`
  flex-shrink: 1;
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.display.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.display.fontWeight};
  line-height: ${({ theme }) => theme.typography.display.lineHeight}px;
`;

const Description = styled.Text`
  flex-shrink: 1;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.body.fontWeight};
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
`;

const DateSummary = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const DateCard = styled.View`
  min-width: 0px;
  min-height: ${({ theme }) => theme.spacing.xxl + theme.spacing.md}px;
  flex: 1;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const DateLabel = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.caption.fontWeight};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;

const DateValue = styled.Text<{ $hasValue: boolean }>`
  flex-shrink: 1;
  color: ${({ $hasValue, theme }) =>
    $hasValue ? theme.colors.primaryPressed : theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
`;

const SelectionMessage = styled.Text<{ $error: boolean }>`
  color: ${({ $error, theme }) =>
    $error ? theme.colors.danger : theme.colors.text};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.caption.fontWeight};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;

const Calendar = styled.View`
  padding: ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const MonthHeader = styled.View`
  min-height: ${({ theme }) => theme.spacing.xl + theme.spacing.sm}px;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`;

const MonthButton = styled.Pressable`
  width: ${({ theme }) => theme.spacing.xl}px;
  min-height: ${({ theme }) => theme.spacing.xl + theme.spacing.sm}px;
  align-items: center;
  justify-content: center;
`;

const MonthArrow = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.title.fontSize}px;
  line-height: ${({ theme }) => theme.typography.title.lineHeight}px;
`;

const MonthTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.title.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.title.fontWeight};
  line-height: ${({ theme }) => theme.typography.title.lineHeight}px;
`;

const WeekdayRow = styled.View`
  flex-direction: row;
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

const Weekday = styled.Text<{ $weekday: number }>`
  width: 14.2857%;
  color: ${({ $weekday, theme }) =>
    $weekday === 0
      ? theme.colors.danger
      : $weekday === 6
        ? theme.colors.info
        : theme.colors.text};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
  text-align: center;
`;

const CalendarGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

const EmptyDay = styled.View`
  width: 14.2857%;
  height: ${({ theme }) => theme.spacing.xl + theme.spacing.md}px;
`;

const DayCell = styled.View<{
  $inRange: boolean;
  $roundedLeft: boolean;
  $roundedRight: boolean;
}>`
  width: 14.2857%;
  height: ${({ theme }) => theme.spacing.xl + theme.spacing.md}px;
  align-items: center;
  justify-content: center;
  border-top-left-radius: ${({ $roundedLeft, theme }) =>
    $roundedLeft ? theme.radius.full : theme.radius.none}px;
  border-bottom-left-radius: ${({ $roundedLeft, theme }) =>
    $roundedLeft ? theme.radius.full : theme.radius.none}px;
  border-top-right-radius: ${({ $roundedRight, theme }) =>
    $roundedRight ? theme.radius.full : theme.radius.none}px;
  border-bottom-right-radius: ${({ $roundedRight, theme }) =>
    $roundedRight ? theme.radius.full : theme.radius.none}px;
  background-color: ${({ $inRange, theme }) =>
    $inRange ? theme.colors.primaryRange : 'transparent'};
`;

const DayButton = styled.Pressable<{ $selected: boolean }>`
  width: ${({ theme }) => theme.spacing.xl + theme.spacing.sm}px;
  height: ${({ theme }) => theme.spacing.xl + theme.spacing.sm}px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ $selected, theme }) =>
    $selected ? theme.colors.primary : 'transparent'};
`;

const DayText = styled.Text<{
  $disabled: boolean;
  $inRange: boolean;
  $selected: boolean;
  $weekday: number;
}>`
  color: ${({ $disabled, $inRange, $selected, $weekday, theme }) => {
    if ($selected) return theme.colors.onPrimary;
    if ($disabled) return theme.colors.textDisabled;
    if ($inRange) return theme.colors.primaryPressed;
    if ($weekday === 0) return theme.colors.danger;
    if ($weekday === 6) return theme.colors.info;
    return theme.colors.text;
  }};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ $inRange, $selected, theme }) =>
    $selected || $inRange
      ? theme.typography.label.fontWeight
      : theme.typography.body.fontWeight};
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
`;

const Footer = styled.View`
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px
    ${({ theme }) => theme.spacing.xxl + theme.spacing.xs}px;
  background-color: ${({ theme }) => theme.colors.background};
`;
