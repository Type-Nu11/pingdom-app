import {
  canRequestReservationCancel,
  getReservationStatusView,
  RESERVATION_STATUSES,
  type ReservationDetailStatus,
  type ReservationStatus,
} from '../reservationPresentation';

const LABEL_KEYS: Record<ReservationStatus, string> = {
  CANCELED: 'reservation.list.statuses.canceled',
  CONFIRMED: 'reservation.list.statuses.confirmed',
  PENDING: 'reservation.list.statuses.pending',
  REJECTED: 'reservation.list.statuses.rejected',
};

describe('RESERVATION_STATUSES', () => {
  it('covers the generated list contract exactly', () => {
    expect([...RESERVATION_STATUSES].sort()).toEqual([
      'CANCELED',
      'CONFIRMED',
      'PENDING',
      'REJECTED',
    ]);
  });

  it('covers every status the scoped detail contract can return', () => {
    // The list, create, and detail endpoints share the `reservation-payment`
    // snapshot, so the detail union is a subset of the list union.
    const detailStatuses: readonly ReservationDetailStatus[] = [
      'PENDING',
      'CONFIRMED',
      'REJECTED',
      'CANCELED',
    ];

    for (const status of detailStatuses) {
      expect(RESERVATION_STATUSES).toContain(status);
    }
  });
});

describe('getReservationStatusView', () => {
  it.each(RESERVATION_STATUSES)('gives %s a label key and text cue', (status) => {
    const view = getReservationStatusView(status);

    expect(view.known).toBe(true);
    expect(view.labelKey).toBe(LABEL_KEYS[status]);
    expect(view.symbol).not.toBe('');
  });

  it('tones confirmation apart from a pending request and a rejection', () => {
    expect(getReservationStatusView('CONFIRMED').tone).toBe('success');
    expect(getReservationStatusView('PENDING').tone).toBe('warning');
    expect(getReservationStatusView('REJECTED').tone).toBe('error');
  });

  it('falls back for an unknown or missing server status', () => {
    expect(getReservationStatusView('RESCHEDULED').known).toBe(false);
    expect(getReservationStatusView('RESCHEDULED').labelKey)
      .toBe('reservation.list.statuses.unknown');
    expect(getReservationStatusView(undefined).labelKey)
      .toBe('reservation.list.statuses.unknown');
    expect(getReservationStatusView(null).labelKey).toBe('reservation.list.statuses.unknown');
  });
});

describe('canRequestReservationCancel', () => {
  it('offers cancel only while the reservation is still live', () => {
    expect(canRequestReservationCancel('PENDING')).toBe(true);
    expect(canRequestReservationCancel('CONFIRMED')).toBe(true);
  });

  it('does not offer cancel for terminal or unknown states', () => {
    for (const status of ['CANCELED', 'REJECTED', 'UNKNOWN', 'NEW'] as const) {
      expect(canRequestReservationCancel(status)).toBe(false);
    }
    expect(canRequestReservationCancel(undefined)).toBe(false);
  });
});
