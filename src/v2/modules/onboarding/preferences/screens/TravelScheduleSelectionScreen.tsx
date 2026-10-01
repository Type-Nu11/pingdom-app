import { Text as AppText } from '../../../../shared/components/Typography';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import styled, { useTheme } from 'styled-components/native';

import OnboardingCtaButton from '../../components/OnboardingCtaButton';
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
} from '../../../travel/calendar';

const DEFAULT_CURRENT_STEP = 7;
const DEFAULT_TOTAL_STEPS = 7;
const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

function Chevron({ color, direction }: Readonly<{ color: string; direction: 'left' | 'right' }>) {
  return (
    <Svg aria-hidden fill="none" height={20} viewBox="0 0 20 20" width={20}>
      <Path
        d={direction === 'left' ? 'M12.5 5L7.5 10L12.5 15' : 'M7.5 5L12.5 10L7.5 15'}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </Svg>
  );
}

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
  const { colors } = useTheme();
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
            <DateCard $active>
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
          ) : null}

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
                <Chevron color={colors.textAlternative} direction="left" />
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
                <Chevron color={colors.textAlternative} direction="right" />
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
        <OnboardingCtaButton
          disabled={!canContinue}
          label={t('onboarding.travelScheduleScreen.continue')}
          loading={isContinuing}
          onPress={onContinue}
        />
      </Footer>
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.backgroundAssistive};
`;

const ContentScroll = styled.ScrollView`
  flex: 1;
`;

const Content = styled.View`
  gap: 16px;
  padding: ${({ theme }) => theme.spacing.md}px;
`;

const Heading = styled.View`
  gap: 0;
`;

const Title = styled(AppText)`
  flex-shrink: 1;
  color: ${({ theme }) => theme.colors.labelStrong};
  font-size: ${({ theme }) => theme.typography.display.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.display.fontWeight};
  line-height: 41.6px;
`;

const Description = styled(AppText)`
  flex-shrink: 1;
  color: ${({ theme }) => theme.colors.textAlternative};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.bodyMedium.fontWeight};
  line-height: 20.8px;
`;

const DateSummary = styled.View`
  flex-direction: row;
  gap: 12px;
`;

// Figma shades the start box as the active field.
const DateCard = styled.View<{ $active?: boolean }>`
  min-width: 0px;
  flex: 1;
  gap: 4px;
  padding: 14px ${({ theme }) => theme.spacing.md}px;
  border-radius: 16px;
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.lineNeutral : theme.colors.backgroundNeutral};
`;

const DateLabel = styled(AppText)`
  color: ${({ theme }) => theme.colors.labelAssistive};
  font-size: 12px;
  font-weight: 500;
  line-height: 14px;
`;

const DateValue = styled(AppText)<{ $hasValue: boolean }>`
  flex-shrink: 1;
  color: ${({ $hasValue, theme }) =>
    $hasValue ? theme.colors.primary : theme.colors.labelAssistive};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize}px;
  font-weight: 700;
  line-height: 18px;
`;

const SelectionMessage = styled(AppText)<{ $error: boolean }>`
  color: ${({ $error, theme }) =>
    $error ? theme.colors.danger : theme.colors.text};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.caption.fontWeight};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;

const Calendar = styled.View`
  min-height: 320px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.backgroundNeutral};
`;

const MonthHeader = styled.View`
  height: 40px;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 8px ${({ theme }) => theme.spacing.md}px;
`;

const MonthButton = styled.Pressable`
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
`;

const MonthTitle = styled(AppText)`
  color: ${({ theme }) => theme.colors.labelNeutral};
  font-size: ${({ theme }) => theme.typography.headline2Bold.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.headline2Bold.fontWeight};
  line-height: 23px;
`;

const WeekdayRow = styled.View`
  height: 20px;
  flex-direction: row;
  align-items: center;
  margin-top: 6px;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
`;

const Weekday = styled(AppText)<{ $weekday: number }>`
  width: 14.2857%;
  color: ${({ theme }) => theme.colors.labelNeutral};
  font-size: 14px;
  font-weight: 500;
  line-height: 18px;
  text-align: center;
`;

const CalendarGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  row-gap: 2px;
  margin-top: 6px;
  padding: 0 ${({ theme }) => theme.spacing.md}px 16px;
`;

const EmptyDay = styled.View`
  width: 14.2857%;
  height: 48px;
`;

const DayCell = styled.View<{
  $inRange: boolean;
  $roundedLeft: boolean;
  $roundedRight: boolean;
}>`
  width: 14.2857%;
  height: 48px;
  align-items: flex-start;
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
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ $selected, theme }) =>
    $selected ? theme.colors.primary : 'transparent'};
`;

const DayText = styled(AppText)<{
  $disabled: boolean;
  $inRange: boolean;
  $selected: boolean;
  $weekday: number;
}>`
  color: ${({ $disabled, $inRange, $selected, $weekday, theme }) => {
    if ($selected) return theme.colors.textInverse;
    if ($disabled) return theme.colors.textDisabled;
    if ($inRange) return theme.colors.primary;
    if ($weekday === 0) return theme.colors.danger;
    if ($weekday === 6) return theme.colors.statusInfo;
    return theme.colors.textAlternative;
  }};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ $inRange, $selected, theme }) =>
    $selected || $inRange
      ? theme.typography.label.fontWeight
      : theme.typography.body.fontWeight};
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
`;

const Footer = styled.View`
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px 51px;
  background-color: ${({ theme }) => theme.colors.backgroundAssistive};
`;
