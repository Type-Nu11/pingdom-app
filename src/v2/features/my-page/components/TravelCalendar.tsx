import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import type { ServerTravelDate } from '../../onboarding-preferences/model/onboardingPreference';
import {
  buildCalendarDays,
  formatCalendarMonth,
  shiftCalendarMonth,
  type CalendarDay,
  type CalendarMonth,
} from '../../onboarding-preferences/model/travelScheduleCalendar';
import ChevronIcon from '../../../shared/assets/icons/chevron-right-20.svg';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

type HighlightedRange = Readonly<{ endDate: ServerTravelDate; startDate: ServerTravelDate }>;

type TravelCalendarProps = {
  highlightedRange: HighlightedRange | null;
  initialMonth: CalendarMonth;
};

export default function TravelCalendar({ highlightedRange, initialMonth }: TravelCalendarProps) {
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
          <WeekRow
            $highlighted={week.some((day) => day !== null && isWithinRange(day.date, highlightedRange))}
            key={`week-${weekIndex}`}
          >
            {week.map((day, dayIndex) => (
              <DayCell key={day?.date ?? `empty-${weekIndex}-${dayIndex}`}>
                {day ? <Day day={day} highlightedRange={highlightedRange} /> : null}
              </DayCell>
            ))}
          </WeekRow>
        ))}
      </Grid>
    </Container>
  );
}

function Day({
  day,
  highlightedRange,
}: {
  day: CalendarDay;
  highlightedRange: HighlightedRange | null;
}) {
  const inRange = isWithinRange(day.date, highlightedRange);
  const isEndpoint = highlightedRange !== null
    && (day.date === highlightedRange.startDate || day.date === highlightedRange.endDate);

  if (isEndpoint) {
    return (
      <DayBadge>
        <DayBadgeText>{day.day}</DayBadgeText>
      </DayBadge>
    );
  }

  return <DayText $inRange={inRange} $weekday={day.weekday}>{day.day}</DayText>;
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
  padding: ${({ theme }) => theme.spacing.sm}px 0 0;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.md}px;
`;

const NavButton = styled.Pressable`
  align-items: center;
  justify-content: center;
`;

const MonthLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 20px;
  font-weight: 700;
`;

const WeekdayRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
`;

const WeekdayText = styled.Text<{ $weekday: number }>`
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: 500;
  text-align: center;
  color: ${({ $weekday, theme }) => weekdayColor($weekday, theme)};
`;

const Grid = styled.View`
  gap: 2px;
  padding: 0 ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.sm}px;
`;

const WeekRow = styled.View<{ $highlighted: boolean }>`
  flex-direction: row;
  align-items: center;
  height: 44px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ $highlighted }) => ($highlighted ? 'rgba(255, 201, 211, 0.48)' : 'transparent')};
`;

const DayCell = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const DayText = styled.Text<{ $inRange: boolean; $weekday: number }>`
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ $inRange }) => ($inRange ? '500' : '400')};
  color: ${({ $inRange, $weekday, theme }) => ($inRange ? theme.colors.primary : weekdayColor($weekday, theme))};
`;

const DayBadge = styled.View`
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const DayBadgeText = styled.Text`
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: 600;
`;

function weekdayColor(weekday: number, theme: { colors: { danger: string; info: string; text: string } }): string {
  if (weekday === 0) return theme.colors.danger;
  if (weekday === 6) return theme.colors.info;
  return theme.colors.text;
}
