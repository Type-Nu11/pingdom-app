import { hasReservableAvailability } from '../useNearbyReservablePlaceIds';

const now = Date.parse('2026-09-03T08:00:00Z');

const availability = (overrides: Record<string, unknown> = {}) => ({
  endsAt: '2026-09-03T09:00:00Z',
  id: 801,
  placeId: 17,
  productId: null,
  productName: null,
  productType: 'GENERAL' as const,
  remainingCapacity: 4,
  startsAt: '2026-09-03T08:30:00Z',
  status: 'ACTIVE' as const,
  totalCapacity: 10,
  ...overrides,
});

describe('hasReservableAvailability', () => {
  test('future active availability with capacity makes a nearby place visible', () => {
    expect(hasReservableAvailability([availability()], now)).toBe(true);
  });

  test.each([
    { status: 'INACTIVE' },
    { remainingCapacity: 0 },
    { endsAt: '2026-09-03T07:59:59Z' },
  ])('inactive, full, or expired availability stays hidden: %p', (overrides) => {
    expect(hasReservableAvailability([availability(overrides)], now)).toBe(false);
  });
});
