import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import type { ServerTravelDate } from '../../onboarding-preferences/model/onboardingPreference';
import {
  buildCalendarDays,
  formatAccessibleTravelDate,
  formatCalendarMonth,
  shiftCalendarMonth,
  type CalendarDay,
  type CalendarMonth,
} from '../../onboarding-preferences/model/travelScheduleCalendar';
import ChevronIcon from '../../../shared/assets/icons/chevron-right-20.svg';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;
const FIGMA_CALENDAR_WIDTH = 354;
const FIGMA_CALENDAR_HEIGHT = 320;
const CALENDAR_ROW_GAP = 2;

type HighlightedRange = Readonly<{ endDate: ServerTravelDate; startDate: ServerTravelDate }>;

type TravelCalendarProps = {
  highlightedRange: HighlightedRange | null;
  initialMonth: CalendarMonth;
  isUpdating?: boolean;
  minimumDate?: ServerTravelDate;
  onDatePress?: (date: ServerTravelDate) => void;
  selectedStartDate?: ServerTravelDate | null;
};

export default function TravelCalendar({
  highlightedRange,
  initialMonth,
  isUpdating = false,
  minimumDate,
  onDatePress,
  selectedStartDate = null,
}: TravelCalendarProps) {
  const { i18n, t } = useTranslation();
  const [calendarMonth, setCalendarMonth] = useState(initialMonth);
  const weeks = chunkIntoWeeks(buildCalendarDays(calendarMonth));

  return (
    <Container testID="v2-my-page-calendar">
      <Header>
        <NavButton
          accessibilityLabel={t('myPage.travel.previousMonth')}
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => setCalendarMonth((month) => shiftCalendarMonth(month, -1))}
        >
          <ChevronIcon height={20} style={PREVIOUS_MONTH_ICON_STYLE} width={20} />
        </NavButton>
        <MonthLabel>{formatCalendarMonth(calendarMonth, i18n.language)}</MonthLabel>
        <NavButton
          accessibilityLabel={t('myPage.travel.nextMonth')}
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => setCalendarMonth((month) => shiftCalendarMonth(month, 1))}
        >
          <ChevronIcon height={20} width={20} />
        </NavButton>
      </Header>

      <WeekdayRow>
        {WEEKDAY_LABELS.map((label, index) => (
          <DayCell key={`weekday-${index}`}>
            <WeekdayText $weekday={index}>{label}</WeekdayText>
          </DayCell>
        ))}
      </WeekdayRow>

      <Grid>
        {weeks.map((week, weekIndex) => (
          <WeekRow key={`week-${weekIndex}`}>
            {week.map((day, dayIndex) => {
              const rangeCell = getRangeCellState(week, dayIndex, highlightedRange);
              const isPast = Boolean(
                day && minimumDate !== undefined && day.date < minimumDate,
              );
              const disabled = !day
                || isUpdating
                || !onDatePress
                || isPast;
              return (
                <CalendarDayCell
                  $past={isPast}
                  $inRange={rangeCell.inRange}
                  $segmentEnd={rangeCell.segmentEnd}
                  $segmentStart={rangeCell.segmentStart}
                  accessibilityLabel={day
                    ? formatAccessibleTravelDate(day.date, i18n.language)
                    : undefined}
                  accessibilityRole={day ? 'button' : undefined}
                  accessibilityState={day ? {
                    disabled,
                    selected: rangeCell.inRange || day.date === selectedStartDate,
                  } : undefined}
                  disabled={disabled}
                  key={day?.date ?? `empty-${weekIndex}-${dayIndex}`}
                  onPress={day && !disabled ? () => onDatePress?.(day.date) : undefined}
                  testID={day ? `v2-my-page-calendar-day-${day.date}` : undefined}
                >
                  {day ? (
                    <Day
                      day={day}
                      highlightedRange={highlightedRange}
                      selectedStartDate={selectedStartDate}
                    />
                  ) : null}
                </CalendarDayCell>
              );
            })}
          </WeekRow>
        ))}
      </Grid>
    </Container>
  );
}

function Day({
  day,
  highlightedRange,
  selectedStartDate,
}: {
  day: CalendarDay;
  highlightedRange: HighlightedRange | null;
  selectedStartDate: ServerTravelDate | null;
}) {
  const inRange = isWithinRange(day.date, highlightedRange);
  const isEndpoint = highlightedRange !== null
    && (day.date === highlightedRange.startDate || day.date === highlightedRange.endDate);
  const isSelectedStart = day.date === selectedStartDate;

  if (isEndpoint || isSelectedStart) {
    return (
      <DayBadge>
        <DayBadgeText>{day.day}</DayBadgeText>
      </DayBadge>
    );
  }

  return <DayText $inRange={inRange} $weekday={day.weekday}>{day.day}</DayText>;
}

export function getCalendarHeight(width: number): number {
  return width * (FIGMA_CALENDAR_HEIGHT / FIGMA_CALENDAR_WIDTH);
}

export function getRangeCellState(
  week: readonly (CalendarDay | null)[],
  dayIndex: number,
  range: HighlightedRange | null,
): Readonly<{ inRange: boolean; segmentEnd: boolean; segmentStart: boolean }> {
  const day = week[dayIndex];
  const inRange = day !== null && isWithinRange(day.date, range);
  if (!inRange) return { inRange: false, segmentEnd: false, segmentStart: false };

  const previousDay = week[dayIndex - 1];
  const nextDay = week[dayIndex + 1];
  return {
    inRange: true,
    segmentEnd: nextDay === undefined || nextDay === null || !isWithinRange(nextDay.date, range),
    segmentStart: previousDay === undefined || previousDay === null || !isWithinRange(previousDay.date, range),
  };
}

function isWithinRange(date: ServerTravelDate, range: HighlightedRange | null): boolean {
  return range !== null && date >= range.startDate && date <= range.endDate;
}

function chunkIntoWeeks(
  days: readonly (CalendarDay | null)[],
): Array<Array<CalendarDay | null>> {
  const weeks: Array<Array<CalendarDay | null>> = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }
  return weeks;
}

const PREVIOUS_MONTH_ICON_STYLE = { transform: [{ rotate: '180deg' }] } as const;

const Container = styled.View`
  width: 100%;
  aspect-ratio: ${FIGMA_CALENDAR_WIDTH / FIGMA_CALENDAR_HEIGHT};
  gap: 6px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 40px;
  gap: 8px;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
`;

const NavButton = styled.Pressable`
  align-items: center;
  justify-content: center;
`;

const MonthLabel = styled.Text.attrs({ maxFontSizeMultiplier: 1 })`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 18px;
  font-weight: 700;
`;

const WeekdayRow = styled.View`
  flex-direction: row;
  align-items: center;
  height: 20px;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
`;

const WeekdayText = styled.Text.attrs({ maxFontSizeMultiplier: 1 })<{ $weekday: number }>`
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: 500;
  text-align: center;
  color: ${({ $weekday, theme }) => weekdayColor($weekday, theme)};
`;

const Grid = styled.View`
  flex: 1;
  min-height: 0;
  gap: ${CALENDAR_ROW_GAP}px;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
`;

const WeekRow = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
`;

const DayCell = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const CalendarDayCell = styled.Pressable<{
  $inRange: boolean;
  $past: boolean;
  $segmentEnd: boolean;
  $segmentStart: boolean;
}>`
  flex: 1;
  align-items: center;
  justify-content: center;
  height: 100%;
  opacity: ${({ $past }) => ($past ? 0.45 : 1)};
  border-top-left-radius: ${({ $segmentStart, theme }) => ($segmentStart ? theme.radius.full : 0)}px;
  border-bottom-left-radius: ${({ $segmentStart, theme }) => ($segmentStart ? theme.radius.full : 0)}px;
  border-top-right-radius: ${({ $segmentEnd, theme }) => ($segmentEnd ? theme.radius.full : 0)}px;
  border-bottom-right-radius: ${({ $segmentEnd, theme }) => ($segmentEnd ? theme.radius.full : 0)}px;
  background-color: ${({ $inRange }) => ($inRange ? 'rgba(255, 201, 211, 0.48)' : 'transparent')};
`;

const DayText = styled.Text.attrs({ maxFontSizeMultiplier: 1 })<{ $inRange: boolean; $weekday: number }>`
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ $inRange }) => ($inRange ? '500' : '400')};
  color: ${({ $inRange, $weekday, theme }) => ($inRange ? theme.colors.primary : weekdayColor($weekday, theme))};
`;

const DayBadge = styled.View`
  align-items: center;
  justify-content: center;
  height: 100%;
  aspect-ratio: 1;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const DayBadgeText = styled.Text.attrs({ maxFontSizeMultiplier: 1 })`
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: 600;
`;

function weekdayColor(weekday: number, theme: { colors: { danger: string; info: string; text: string } }): string {
  if (weekday === 0) return theme.colors.danger;
  if (weekday === 6) return theme.colors.info;
  return theme.colors.text;
}
