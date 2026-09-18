import type { ApiSchema } from '../../../../shared/api/contract';

export const reservationFixture = {
  id: 901,
  touristUserId: 201,
  availabilityId: 801,
  productId: 601,
  productType: 'SERVICE',
  quantity: 2,
  status: 'PENDING',
  createdAt: '2026-07-23T05:30:00Z',
  confirmedAt: null,
  canceledAt: null,
  completedAt: null,
  updatedAt: '2026-07-23T05:30:00Z',
} satisfies ApiSchema<'Reservation'>;

export const reservationPageFixture = {
  reservations: [reservationFixture],
  page: 1,
  limit: 20,
  totalCount: 1,
  totalPages: 1,
  hasNext: false,
} satisfies ApiSchema<'ReservationPage'>;

export const emptyOwnedReservationPageFixture = { ...reservationPageFixture, reservations: [], totalCount: 0, totalPages: 0 };
