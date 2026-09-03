import type { AssertNever } from '../../../shared/model';
import type { Availability } from './reservationAvailability';

/**
 * Every availability names a reservation target through `productType`:
 *
 * - `GENERAL` books the place itself; there is no separate product, so a null or
 *   missing `productId` is normal and the place name is the reservation target.
 * - `TICKET` / `CLASS` book a specific merchant product (an admission pass, an
 *   experience). They need at least a product name, which the current server
 *   contract does not carry.
 *
 * The list is kept in lockstep with the generated contract by the assertions
 * below, so a server-side rename or addition breaks the build here rather than
 * silently changing behaviour.
 */
export const RESERVATION_PRODUCT_TYPES = ['GENERAL', 'TICKET', 'CLASS'] as const;

export type ReservationProductType = (typeof RESERVATION_PRODUCT_TYPES)[number];

type EveryContractProductTypeIsListed = AssertNever<
  Exclude<Availability['productType'], ReservationProductType>
>;
type EveryListedProductTypeIsInContract = AssertNever<
  Exclude<ReservationProductType, Availability['productType']>
>;
export type ReservationProductContractAssertions = [
  EveryContractProductTypeIsListed,
  EveryListedProductTypeIsInContract,
];

/**
 * i18n keys for the two "cannot be reserved yet" notices. They live beside the
 * selector so a screen never has to invent copy for a blocked availability, and
 * ko/en text ships in the reservation bundle.
 */
export const AVAILABILITY_BLOCKED_REASON_KEYS = {
  missingProduct: 'reservation.create.productInfoUnavailable',
  unknownType: 'reservation.create.unknownReservationType',
} as const;

/**
 * A per-availability decision the create screen can render without re-deriving
 * product rules. Only `place` is selectable today; `blockedProduct` and
 * `unknownType` are shown as disabled rows with an explicit reason so they read
 * as "not bookable yet" rather than an empty list or a network error.
 *
 * When the server contract gains `productName`, `blockedProduct` becomes the
 * seam where a `product` presentation (type + name) is added.
 */
export type AvailabilityPresentation =
  | {
    kind: 'place';
    productType: 'GENERAL';
    availability: Availability;
  }
  | {
    kind: 'blockedProduct';
    productType: 'TICKET' | 'CLASS';
    availability: Availability;
    reasonKey: typeof AVAILABILITY_BLOCKED_REASON_KEYS.missingProduct;
  }
  | {
    kind: 'unknownType';
    rawProductType: string | null;
    availability: Availability;
    reasonKey: typeof AVAILABILITY_BLOCKED_REASON_KEYS.unknownType;
  };

export function selectAvailabilityPresentation(
  availability: Availability,
): AvailabilityPresentation {
  // The generated contract narrows `productType` to a three-value union, but the
  // live server can still send a value this build has never seen. Read it as a
  // loose string so an unmapped or missing type falls through to `unknownType`
  // instead of being treated as `GENERAL`.
  const rawProductType = availability.productType as string | null | undefined;

  switch (rawProductType) {
    case 'GENERAL':
      return { kind: 'place', productType: 'GENERAL', availability };
    case 'TICKET':
      return {
        kind: 'blockedProduct',
        productType: 'TICKET',
        availability,
        reasonKey: AVAILABILITY_BLOCKED_REASON_KEYS.missingProduct,
      };
    case 'CLASS':
      return {
        kind: 'blockedProduct',
        productType: 'CLASS',
        availability,
        reasonKey: AVAILABILITY_BLOCKED_REASON_KEYS.missingProduct,
      };
    default:
      return {
        kind: 'unknownType',
        rawProductType:
          typeof rawProductType === 'string' && rawProductType.length > 0
            ? rawProductType
            : null,
        availability,
        reasonKey: AVAILABILITY_BLOCKED_REASON_KEYS.unknownType,
      };
  }
}

export function isSelectableAvailabilityPresentation(
  presentation: AvailabilityPresentation,
): presentation is Extract<AvailabilityPresentation, { kind: 'place' }> {
  return presentation.kind === 'place';
}

/** Whether this availability is a GENERAL place reservation the app can submit. */
export function isSelectableAvailability(availability: Availability): boolean {
  return selectAvailabilityPresentation(availability).kind === 'place';
}

export type AvailabilityPresentationSummary = Readonly<{
  total: number;
  place: number;
  blockedProduct: number;
  unknownType: number;
}>;

export function summarizeAvailabilityPresentations(
  availabilities: readonly Availability[],
): AvailabilityPresentationSummary {
  return availabilities.reduce(
    (summary, availability) => {
      const { kind } = selectAvailabilityPresentation(availability);
      return {
        total: summary.total + 1,
        place: summary.place + (kind === 'place' ? 1 : 0),
        blockedProduct: summary.blockedProduct + (kind === 'blockedProduct' ? 1 : 0),
        unknownType: summary.unknownType + (kind === 'unknownType' ? 1 : 0),
      };
    },
    { total: 0, place: 0, blockedProduct: 0, unknownType: 0 },
  );
}
