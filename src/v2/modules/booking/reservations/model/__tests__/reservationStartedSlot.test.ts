import { isAvailabilityBookable, isAvailabilityUpcoming, nearestBookableAvailability, type Availability } from '../reservationAvailability';
import { reservationSubmitErrorKey } from '../reservationError';
import { ApiError } from '../../../../../shared/api';

const now = new Date('2026-10-14T00:00:00Z');
const started = { id: 5, startsAt: '2026-10-13T13:35:00Z', endsAt: '2027-08-14T23:59:00Z', status: 'ACTIVE', remainingCapacity: 100 } as Availability;
const future = { ...started, id: 6, startsAt: '2026-10-24T14:00:00Z', endsAt: '2026-10-24T15:00:00Z', remainingCapacity: 4 };
test('a started long interval never becomes bookable merely because its end is in the future', () => {
  expect(isAvailabilityBookable(started, 2, now)).toBe(false);
  expect(isAvailabilityUpcoming(started, now)).toBe(false);
  expect(nearestBookableAvailability([started, future], 2, now)?.id).toBe(6);
  expect(isAvailabilityBookable(future, 5, now)).toBe(false);
  expect(isAvailabilityBookable(future, 2, new Date(future.startsAt))).toBe(false);
});
test('ambiguous legacy capacity errors distinguish started slots from genuine capacity failure', () => {
  const error = new ApiError('private', { status: 409, code: 'AVAILABILITY_CAPACITY_EXCEEDED' });
  expect(reservationSubmitErrorKey(error, started, now)).toBe('reservation.create.submitAvailabilityError');
  expect(reservationSubmitErrorKey(error, future, now)).toBe('reservation.create.submitCapacityError');
  expect(reservationSubmitErrorKey(new ApiError('private', { code: 'RESERVATION_SLOT_INACTIVE' }))).toBe('reservation.create.submitAvailabilityError');
});
