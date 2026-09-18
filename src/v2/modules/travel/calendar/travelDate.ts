import type { CreateTravelScheduleBody } from '../schedules';

export type TravelDateInput = Readonly<{
  endDateText: string;
  startDateText: string;
}>;

declare const serverTravelDateBrand: unique symbol;

export type ServerTravelDate = CreateTravelScheduleBody['startDate'] & {
  readonly [serverTravelDateBrand]: 'ServerTravelDate';
};

export type TravelDateRange = Readonly<{
  endDate: ServerTravelDate;
  startDate: ServerTravelDate;
}>;

const SERVER_TRAVEL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number): number {
  const days = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return days[month - 1] ?? 0;
}

export function isServerTravelDate(value: unknown): value is ServerTravelDate {
  if (typeof value !== 'string') {
    return false;
  }

  const match = SERVER_TRAVEL_DATE_PATTERN.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month);
}

export function parseTravelDateRange(input: TravelDateInput): TravelDateRange | null {
  const { endDateText, startDateText } = input;

  if (
    !isServerTravelDate(startDateText)
    || !isServerTravelDate(endDateText)
    || endDateText < startDateText
  ) {
    return null;
  }

  return {
    endDate: endDateText,
    startDate: startDateText,
  };
}

export function toCreateTravelScheduleBody(
  range: TravelDateRange,
): CreateTravelScheduleBody {
  return {
    endDate: range.endDate,
    startDate: range.startDate,
  };
}
