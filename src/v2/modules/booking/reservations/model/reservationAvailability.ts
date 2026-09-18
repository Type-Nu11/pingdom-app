import type { AvailabilityList } from '../api/reservationApi';

export type Availability = AvailabilityList[number];

export function localDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function availabilityDateKey(availability: Availability): string {
  return localDateKey(new Date(availability.startsAt));
}

function localDayFromKey(dateKey: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return localDateKey(date) === dateKey ? date : null;
}

/**
 * Availability is a server-owned time interval. Calendar dates use local-day
 * overlap instead of only the interval's starting date. The end is exclusive,
 * so an interval ending exactly at midnight does not enable the following day.
 */
export function availabilityDateKeys(availability: Availability): string[] {
  const startsAt = new Date(availability.startsAt);
  const endsAt = new Date(availability.endsAt);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
    return [];
  }

  const keys: string[] = [];
  let day = startOfLocalDay(startsAt);
  for (let count = 0; count < 3_660 && day.getTime() < endsAt.getTime(); count += 1) {
    const nextDay = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
    if (nextDay.getTime() > startsAt.getTime()) keys.push(localDateKey(day));
    day = nextDay;
  }
  return keys;
}

export function availabilityIncludesDate(
  availability: Availability,
  dateKey: string,
): boolean {
  const day = localDayFromKey(dateKey);
  if (!day) return false;
  const startsAt = new Date(availability.startsAt);
  const endsAt = new Date(availability.endsAt);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) return false;
  const nextDay = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
  return day.getTime() < endsAt.getTime() && nextDay.getTime() > startsAt.getTime();
}

export function localDateFromKey(dateKey: string): Date | null {
  return localDayFromKey(dateKey);
}

export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfLocalMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addLocalMonths(date: Date, offset: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

export function isAvailabilityBookable(
  availability: Availability,
  quantity: number,
  now: Date,
): boolean {
  const endsAt = new Date(availability.endsAt);
  return availability.status === 'ACTIVE'
    && availability.remainingCapacity >= quantity
    && !Number.isNaN(endsAt.getTime())
    && endsAt.getTime() > now.getTime();
}

export function isAvailabilityUpcoming(
  availability: Availability,
  now: Date,
): boolean {
  const endsAt = new Date(availability.endsAt);
  return !Number.isNaN(endsAt.getTime()) && endsAt.getTime() > now.getTime();
}

export function nearestBookableAvailability(
  availabilities: AvailabilityList,
  quantity: number,
  now: Date,
): Availability | undefined {
  return availabilities
    .filter((availability) => isAvailabilityBookable(availability, quantity, now))
    .sort((left, right) =>
      new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime())[0];
}

export function nearestUpcomingAvailability(
  availabilities: AvailabilityList,
  now: Date,
): Availability | undefined {
  return availabilities
    .filter((availability) => isAvailabilityUpcoming(availability, now))
    .sort((left, right) =>
      new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime())[0];
}

export function buildLocalCalendar(month: Date): Array<Date | null> {
  const first = startOfLocalMonth(month);
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return [
    ...Array(first.getDay()).fill(null),
    ...Array.from(
      { length: days },
      (_, index) => new Date(first.getFullYear(), first.getMonth(), index + 1),
    ),
  ];
}

export function createReservationIdempotencyKey(
  now: () => number = Date.now,
  random: () => number = Math.random,
): string {
  const bytes = new Uint8Array(16);
  const cryptoObject = globalThis.crypto;

  if (cryptoObject?.getRandomValues) {
    cryptoObject.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(random() * 256);
    }
  }

  const entropy = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `reservation-${now().toString(36)}-${entropy}`;
}
