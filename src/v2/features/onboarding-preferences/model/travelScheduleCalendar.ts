import {
  isServerTravelDate,
  parseTravelDateRange,
  type ServerTravelDate,
  type TravelDateInput,
  type TravelDateRange,
} from './onboardingPreference';

export type CalendarMonth = Readonly<{
  month: number;
  year: number;
}>;

export type CalendarDay = Readonly<{
  date: ServerTravelDate;
  day: number;
  weekday: number;
}>;

export type TravelScheduleSelectionState =
  | Readonly<{ kind: 'complete'; range: TravelDateRange }>
  | Readonly<{ kind: 'empty' }>
  | Readonly<{ kind: 'invalid' }>
  | Readonly<{ kind: 'start-only'; startDate: ServerTravelDate }>;

const EMPTY_END_DATE = '';

export function getTravelScheduleSelectionState(
  schedule: TravelDateInput,
): TravelScheduleSelectionState {
  const range = parseTravelDateRange(schedule);
  if (range) {
    return { kind: 'complete', range };
  }

  if (schedule.startDateText === '' && schedule.endDateText === '') {
    return { kind: 'empty' };
  }

  if (
    isServerTravelDate(schedule.startDateText)
    && schedule.endDateText === EMPTY_END_DATE
  ) {
    return { kind: 'start-only', startDate: schedule.startDateText };
  }

  return { kind: 'invalid' };
}

export function selectTravelDate(
  schedule: TravelDateInput,
  date: ServerTravelDate,
): TravelDateInput {
  const state = getTravelScheduleSelectionState(schedule);

  if (state.kind === 'start-only') {
    if (date < state.startDate) {
      return schedule;
    }

    return {
      endDateText: date,
      startDateText: state.startDate,
    };
  }

  return {
    endDateText: EMPTY_END_DATE,
    startDateText: date,
  };
}

export function getInitialCalendarMonth(
  schedule: TravelDateInput,
  today: Date = new Date(),
): CalendarMonth {
  if (isServerTravelDate(schedule.startDateText)) {
    return serverDateToMonth(schedule.startDateText);
  }

  if (isServerTravelDate(schedule.endDateText)) {
    return serverDateToMonth(schedule.endDateText);
  }

  return {
    month: today.getMonth() + 1,
    year: today.getFullYear(),
  };
}

export function shiftCalendarMonth(
  calendarMonth: CalendarMonth,
  offset: number,
): CalendarMonth {
  const shifted = new Date(Date.UTC(
    calendarMonth.year,
    calendarMonth.month - 1 + offset,
    1,
  ));

  return {
    month: shifted.getUTCMonth() + 1,
    year: shifted.getUTCFullYear(),
  };
}

export function buildCalendarDays(
  calendarMonth: CalendarMonth,
): readonly (CalendarDay | null)[] {
  const firstWeekday = new Date(Date.UTC(
    calendarMonth.year,
    calendarMonth.month - 1,
    1,
  )).getUTCDay();
  const dayCount = new Date(Date.UTC(
    calendarMonth.year,
    calendarMonth.month,
    0,
  )).getUTCDate();
  const days: Array<CalendarDay | null> = Array.from(
    { length: firstWeekday },
    () => null,
  );

  for (let day = 1; day <= dayCount; day += 1) {
    days.push({
      date: toServerTravelDate(calendarMonth.year, calendarMonth.month, day),
      day,
      weekday: (firstWeekday + day - 1) % 7,
    });
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

export function formatCalendarMonth(
  calendarMonth: CalendarMonth,
  locale: string,
): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(new Date(Date.UTC(calendarMonth.year, calendarMonth.month - 1, 1)));
}

export function formatAccessibleTravelDate(
  date: ServerTravelDate,
  locale: string,
): string {
  const { day, month, year } = serverDateParts(date);

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatDisplayTravelDate(date: ServerTravelDate): string {
  const { day, month, year } = serverDateParts(date);
  return `${year}.${padNumber(month)}.${padNumber(day)}`;
}

function serverDateToMonth(date: ServerTravelDate): CalendarMonth {
  const { month, year } = serverDateParts(date);
  return { month, year };
}

function serverDateParts(date: ServerTravelDate) {
  const [year, month, day] = date.split('-').map(Number);
  return { day, month, year };
}

function toServerTravelDate(
  year: number,
  month: number,
  day: number,
): ServerTravelDate {
  const date = `${year}-${padNumber(month)}-${padNumber(day)}`;
  if (!isServerTravelDate(date)) {
    throw new Error(`Invalid calendar date: ${date}`);
  }

  return date;
}

function padNumber(value: number): string {
  return String(value).padStart(2, '0');
}
