import {
  createStatusViewResolver,
  type AssertNever,
  type StatusPresentation,
  type StatusView,
} from '../../../shared/model';
import type { Reservation, ReservationDetail } from '../api/reservationApi';

/**
 * Reservations are typed by two generated contracts: the app-wide `mvp` one
 * behind the list and create endpoints, and the scoped `reservationPayment`
 * snapshot behind `GET /reservations/{id}`, which the live server currently
 * narrows to three states.
 *
 * `ReservationStatus` is the `mvp` union because it is the wider of the two, so
 * a value from either endpoint fits. The assertion below fails to compile if the
 * scoped contract ever gains a state the wide one does not have — the point
 * where a single presentation map would silently stop covering everything.
 */
export type ReservationStatus = Reservation['status'];
export type ReservationDetailStatus = ReservationDetail['status'];

type DetailStatusesAreCoveredByListStatuses = AssertNever<
  Exclude<ReservationDetailStatus, ReservationStatus>
>;

export const RESERVATION_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'COMPLETED',
  'NO_SHOW',
  'CANCELED',
  'EXPIRED',
  'UNKNOWN',
] as const satisfies readonly ReservationStatus[];

type AllReservationStatusesAreListed = AssertNever<
  Exclude<ReservationStatus, (typeof RESERVATION_STATUSES)[number]>
>;

export type ReservationStatusContractAssertions = [
  DetailStatusesAreCoveredByListStatuses,
  AllReservationStatusesAreListed,
];

/**
 * Label keys come from the reservation i18n bundle, which carries ko and en copy
 * for every state. `UNKNOWN` is both a contract value and the fallback, so a
 * state this build has never seen reads as "needs review" rather than blank.
 */
const RESERVATION_STATUS_PRESENTATIONS: Readonly<
  Record<ReservationStatus, StatusPresentation>
> = {
  CANCELED: { labelKey: 'reservation.list.statuses.canceled', tone: 'neutral' },
  COMPLETED: { labelKey: 'reservation.list.statuses.completed', tone: 'success' },
  CONFIRMED: { labelKey: 'reservation.list.statuses.confirmed', tone: 'success' },
  EXPIRED: { labelKey: 'reservation.list.statuses.expired', tone: 'neutral' },
  NO_SHOW: { labelKey: 'reservation.list.statuses.noShow', tone: 'error' },
  PENDING: { labelKey: 'reservation.list.statuses.pending', tone: 'warning' },
  UNKNOWN: { labelKey: 'reservation.list.statuses.unknown', tone: 'neutral' },
};

export const getReservationStatusView: (
  status: ReservationStatus | string | null | undefined,
) => StatusView<ReservationStatus> = createStatusViewResolver(
  RESERVATION_STATUS_PRESENTATIONS,
  { labelKey: 'reservation.list.statuses.unknown', tone: 'neutral' },
);

/**
 * Whether a cancel action may be offered for this reservation.
 *
 * This reports what the UI may *ask* for; it never anticipates the result. The
 * client does not advance a reservation to `CANCELED` on its own — the screen
 * shows whatever status comes back from the server.
 */
export function canRequestReservationCancel(
  status: ReservationStatus | string | null | undefined,
): boolean {
  return status === 'PENDING' || status === 'CONFIRMED';
}
