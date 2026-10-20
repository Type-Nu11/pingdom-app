// Established Place-detail cache identity, now owned by Booking. Keep it distinct
// from reservation-create availability keys until a separately reviewed cache migration.
export const placeAvailabilityQueryKeys = {
  availabilities: (placeId: number) =>
    ['v2', 'places', 'entity', placeId, 'availabilities'] as const,
};
