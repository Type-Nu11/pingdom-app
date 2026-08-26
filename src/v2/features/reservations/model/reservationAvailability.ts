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
  const startsAt = new Date(availability.startsAt);
  return availability.status === 'ACTIVE'
    && availability.remainingCapacity >= quantity
    && !Number.isNaN(startsAt.getTime())
    && startsAt.getTime() >= now.getTime();
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
