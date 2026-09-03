import {
  createStatusViewResolver,
  type AssertNever,
  type StatusPresentation,
  type StatusView,
} from '../../../shared/model';
import type { Reservation, ReservationDetail } from '../api/reservationApi';

/**
 * The tourist list, create, and detail endpoints are all typed by the same
 * `reservation-payment` snapshot synced from the live `app` group, so both
 * unions below resolve to `PENDING | CONFIRMED | REJECTED | CANCELED`. The
 * assertion still guards the invariant: if the detail contract ever gains a
 * state the list contract does not have, a single presentation map would
 * silently stop covering everything.
 */
export type ReservationStatus = Reservation['status'];
export type ReservationDetailStatus = ReservationDetail['status'];

type DetailStatusesAreCoveredByListStatuses = AssertNever<
  Exclude<ReservationDetailStatus, ReservationStatus>
>;

export const RESERVATION_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'REJECTED',
  'CANCELED',
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
 * for every state plus the `unknown` fallback, so a state this build has never
 * seen reads as "needs review" rather than blank.
 */
const RESERVATION_STATUS_PRESENTATIONS: Readonly<
  Record<ReservationStatus, StatusPresentation>
> = {
  CANCELED: { labelKey: 'reservation.list.statuses.canceled', tone: 'neutral' },
  CONFIRMED: { labelKey: 'reservation.list.statuses.confirmed', tone: 'success' },
  PENDING: { labelKey: 'reservation.list.statuses.pending', tone: 'warning' },
  REJECTED: { labelKey: 'reservation.list.statuses.rejected', tone: 'error' },
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
