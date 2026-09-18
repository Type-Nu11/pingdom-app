import type { Availability } from '../reservationAvailability';
import {
  isSelectableAvailability,
  isSelectableAvailabilityPresentation,
  RESERVATION_PRODUCT_TYPES,
  selectAvailabilityPresentation,
  summarizeAvailabilityPresentations,
} from '../reservationProduct';

const BASE = {
  id: 1,
  placeId: 2,
  productId: 3,
  productType: 'GENERAL',
  startsAt: '2026-08-01T10:00:00Z',
  endsAt: '2026-08-01T11:00:00Z',
  totalCapacity: 10,
  remainingCapacity: 5,
  status: 'ACTIVE',
} as const;

function availability(overrides: Record<string, unknown> = {}): Availability {
  return { ...BASE, ...overrides } as unknown as Availability;
}

describe('selectAvailabilityPresentation', () => {
  it('treats GENERAL as a bookable place reservation', () => {
    const presentation = selectAvailabilityPresentation(availability({ productType: 'GENERAL' }));

    expect(presentation.kind).toBe('place');
    expect(isSelectableAvailabilityPresentation(presentation)).toBe(true);
  });

  it('does not require a productId for a GENERAL place reservation', () => {
    expect(selectAvailabilityPresentation(availability({ productType: 'GENERAL', productId: null })).kind)
      .toBe('place');
    expect(selectAvailabilityPresentation(availability({ productType: 'GENERAL', productId: undefined })).kind)
      .toBe('place');
  });

  it.each(['TICKET', 'CLASS'] as const)(
    'blocks %s while the contract carries no product name',
    (productType) => {
      const presentation = selectAvailabilityPresentation(availability({ productType }));

      expect(presentation.kind).toBe('blockedProduct');
      expect(presentation).toMatchObject({ productType, reasonKey: 'reservation.create.productInfoUnavailable' });
      expect(isSelectableAvailabilityPresentation(presentation)).toBe(false);
    },
  );

  it('does not fall back to GENERAL for an unknown product type', () => {
    const presentation = selectAvailabilityPresentation(availability({ productType: 'TABLE' }));

    expect(presentation.kind).toBe('unknownType');
    expect(presentation).toMatchObject({
      rawProductType: 'TABLE',
      reasonKey: 'reservation.create.unknownReservationType',
    });
  });

  it('tolerates a missing product type without throwing or guessing GENERAL', () => {
    const presentation = selectAvailabilityPresentation(availability({ productType: undefined }));

    expect(presentation.kind).toBe('unknownType');
    expect(presentation).toMatchObject({ rawProductType: null });
  });
});

describe('isSelectableAvailability', () => {
  it('is true only for GENERAL', () => {
    expect(isSelectableAvailability(availability({ productType: 'GENERAL' }))).toBe(true);
    expect(isSelectableAvailability(availability({ productType: 'TICKET' }))).toBe(false);
    expect(isSelectableAvailability(availability({ productType: 'CLASS' }))).toBe(false);
    expect(isSelectableAvailability(availability({ productType: 'MYSTERY' }))).toBe(false);
  });
});

describe('summarizeAvailabilityPresentations', () => {
  it('counts each presentation bucket', () => {
    expect(summarizeAvailabilityPresentations([
      availability({ id: 1, productType: 'GENERAL' }),
      availability({ id: 2, productType: 'TICKET' }),
      availability({ id: 3, productType: 'CLASS' }),
      availability({ id: 4, productType: 'MYSTERY' }),
    ])).toEqual({ total: 4, place: 1, blockedProduct: 2, unknownType: 1 });
  });

  it('is all zeroes for an empty list', () => {
    expect(summarizeAvailabilityPresentations([]))
      .toEqual({ total: 0, place: 0, blockedProduct: 0, unknownType: 0 });
  });
});

describe('RESERVATION_PRODUCT_TYPES', () => {
  it('matches the generated availability contract exactly', () => {
    expect([...RESERVATION_PRODUCT_TYPES].sort()).toEqual(['CLASS', 'GENERAL', 'TICKET']);
  });
});
