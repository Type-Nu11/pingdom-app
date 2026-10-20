# #359 Booking migration inventory

Implementation: V2. Baseline `ea321b90fc3b265b1f430c1cda84885ff2668a9a`.
Three flat features had 52 files: Reservations 25, Payments 7, Offers/Coupons 20.
Shared Booking tests and mocks now follow Booking ownership. No assertion was removed.

## Before / after mapping

| Before | After |
|---|---|
| `src/v2/features/offers-coupons/__tests__/offerCoupon.contract.types.ts` | `src/v2/modules/booking/offers-coupons/__tests__/offerCoupon.contract.types.ts` |
| `src/v2/features/offers-coupons/__tests__/offerCouponErrorUx.test.ts` | `src/v2/modules/booking/offers-coupons/__tests__/offerCouponErrorUx.test.ts` |
| `src/v2/features/offers-coupons/api/__tests__/offerCouponApi.test.ts` | `src/v2/modules/booking/offers-coupons/api/__tests__/offerCouponApi.test.ts` |
| `src/v2/features/offers-coupons/api/offerCouponApi.ts` | `src/v2/modules/booking/offers-coupons/api/offerCouponApi.ts` |
| `src/v2/features/offers-coupons/components/OfferCouponErrorState.tsx` | `src/v2/modules/booking/offers-coupons/components/OfferCouponErrorState.tsx` |
| `src/v2/features/offers-coupons/components/PlaceCouponCta.tsx` | `src/v2/modules/booking/offers-coupons/components/PlaceCouponCta.tsx` |
| `src/v2/features/offers-coupons/components/__tests__/OfferCouponErrorState.test.tsx` | `src/v2/modules/booking/offers-coupons/components/__tests__/OfferCouponErrorState.test.tsx` |
| `src/v2/features/offers-coupons/components/__tests__/PlaceCouponCta.test.tsx` | `src/v2/modules/booking/offers-coupons/components/__tests__/PlaceCouponCta.test.tsx` |
| `src/v2/features/offers-coupons/data/index.ts` | `src/v2/modules/booking/offers-coupons/__tests__/index.ts (test-only API)` |
| `src/v2/features/offers-coupons/hooks/__tests__/useIssueCoupon.test.tsx` | `src/v2/modules/booking/offers-coupons/hooks/__tests__/useIssueCoupon.test.tsx` |
| `src/v2/features/offers-coupons/hooks/__tests__/useOffersCoupons.test.tsx` | `src/v2/modules/booking/offers-coupons/hooks/__tests__/useOffersCoupons.test.tsx` |
| `src/v2/features/offers-coupons/hooks/useOffersCoupons.ts` | `src/v2/modules/booking/offers-coupons/hooks/useOffersCoupons.ts` |
| `src/v2/features/offers-coupons/i18n/index.ts` | `src/v2/modules/booking/offers-coupons/i18n/index.ts` |
| `src/v2/features/offers-coupons/i18n/offerCouponResources.ts` | `src/v2/modules/booking/offers-coupons/i18n/offerCouponResources.ts` |
| `src/v2/features/offers-coupons/index.ts` | `src/v2/modules/booking/offers-coupons/index.ts` |
| `src/v2/features/offers-coupons/model/__tests__/couponPresentation.test.ts` | `src/v2/modules/booking/offers-coupons/model/__tests__/couponPresentation.test.ts` |
| `src/v2/features/offers-coupons/model/__tests__/offerPresentation.test.ts` | `src/v2/modules/booking/offers-coupons/model/__tests__/offerPresentation.test.ts` |
| `src/v2/features/offers-coupons/model/couponPresentation.ts` | `src/v2/modules/booking/offers-coupons/model/couponPresentation.ts` |
| `src/v2/features/offers-coupons/model/getOfferCouponErrorUx.ts` | `src/v2/modules/booking/offers-coupons/model/getOfferCouponErrorUx.ts` |
| `src/v2/features/offers-coupons/model/offerPresentation.ts` | `src/v2/modules/booking/offers-coupons/model/offerPresentation.ts` |
| `src/v2/features/payments/api/paymentApi.ts` | `src/v2/modules/booking/payments/api/paymentApi.ts` |
| `src/v2/features/payments/hooks/usePayments.ts` | `src/v2/modules/booking/payments/hooks/usePayments.ts` |
| `src/v2/features/payments/index.ts` | `src/v2/modules/booking/payments/index.ts` |
| `src/v2/features/payments/model/__tests__/paymentPresentation.test.ts` | `src/v2/modules/booking/payments/model/__tests__/paymentPresentation.test.ts` |
| `src/v2/features/payments/model/payment.types.ts` | `src/v2/modules/booking/payments/model/payment.types.ts` |
| `src/v2/features/payments/model/paymentPresentation.ts` | `src/v2/modules/booking/payments/model/paymentPresentation.ts` |
| `src/v2/features/payments/model/paymentQueryKeys.ts` | `src/v2/modules/booking/payments/model/paymentQueryKeys.ts` |
| `src/v2/features/reservations/api/reservationApi.ts` | `src/v2/modules/booking/reservations/api/reservationApi.ts` |
| `src/v2/features/reservations/components/ReservationBottomSheet.tsx` | `src/v2/modules/booking/reservations/components/ReservationBottomSheet.tsx` |
| `src/v2/features/reservations/components/ReservationRecordCard.tsx` | `src/v2/modules/booking/reservations/components/ReservationRecordCard.tsx` |
| `src/v2/features/reservations/components/__tests__/ReservationBottomSheet.test.tsx` | `src/v2/modules/booking/reservations/components/__tests__/ReservationBottomSheet.test.tsx` |
| `src/v2/features/reservations/data/index.ts` | `src/v2/modules/booking/reservations/__tests__/index.ts (test-only API)` |
| `src/v2/features/reservations/hooks/__tests__/useNearbyReservablePlaceIds.test.ts` | `src/v2/modules/booking/reservations/hooks/__tests__/useNearbyReservablePlaceIds.test.ts` |
| `src/v2/features/reservations/hooks/__tests__/useReservations.test.tsx` | `src/v2/modules/booking/reservations/hooks/__tests__/useReservations.test.tsx` |
| `src/v2/features/reservations/hooks/useNearbyReservablePlaceIds.ts` | `src/v2/modules/booking/reservations/hooks/useNearbyReservablePlaceIds.ts` |
| `src/v2/features/reservations/hooks/useReservations.ts` | `src/v2/modules/booking/reservations/hooks/useReservations.ts` |
| `src/v2/features/reservations/i18n/index.ts` | `src/v2/modules/booking/reservations/i18n/index.ts` |
| `src/v2/features/reservations/i18n/reservationResources.ts` | `src/v2/modules/booking/reservations/i18n/reservationResources.ts` |
| `src/v2/features/reservations/index.ts` | `src/v2/modules/booking/reservations/index.ts` |
| `src/v2/features/reservations/map-sheet/index.ts` | `src/v2/modules/booking/reservations/map-sheet/index.ts` |
| `src/v2/features/reservations/model/__tests__/reservationBooker.test.ts` | `src/v2/modules/booking/reservations/model/__tests__/reservationBooker.test.ts` |
| `src/v2/features/reservations/model/__tests__/reservationPresentation.test.ts` | `src/v2/modules/booking/reservations/model/__tests__/reservationPresentation.test.ts` |
| `src/v2/features/reservations/model/__tests__/reservationProduct.test.ts` | `src/v2/modules/booking/reservations/model/__tests__/reservationProduct.test.ts` |
| `src/v2/features/reservations/model/reservationAvailability.ts` | `src/v2/modules/booking/reservations/model/reservationAvailability.ts` |
| `src/v2/features/reservations/model/reservationBooker.ts` | `src/v2/modules/booking/reservations/model/reservationBooker.ts` |
| `src/v2/features/reservations/model/reservationPresentation.ts` | `src/v2/modules/booking/reservations/model/reservationPresentation.ts` |
| `src/v2/features/reservations/model/reservationProduct.ts` | `src/v2/modules/booking/reservations/model/reservationProduct.ts` |
| `src/v2/features/reservations/screens/CreateReservationScreen.tsx` | `src/v2/modules/booking/reservations/screens/CreateReservationScreen.tsx` |
| `src/v2/features/reservations/screens/ReservationBoxScreen.tsx` | `src/v2/modules/booking/reservations/screens/ReservationBoxScreen.tsx` |
| `src/v2/features/reservations/screens/ReservationDetailScreen.tsx` | `src/v2/modules/booking/reservations/screens/ReservationDetailScreen.tsx` |
| `src/v2/features/reservations/screens/__tests__/ReservationBoxScreen.test.tsx` | `src/v2/modules/booking/reservations/__tests__/ReservationBoxScreen.test.tsx` |
| `src/v2/features/reservations/screens/__tests__/ReservationScreens.test.tsx` | `src/v2/modules/booking/reservations/__tests__/ReservationScreens.test.tsx` |
| `src/v2/shared/api/__tests__/offerPresentation.test.mjs` | `src/v2/modules/booking/__tests__/offerPresentation.test.mjs` |
| `src/v2/shared/api/__tests__/reservationPayment.contract.types.ts` | `src/v2/modules/booking/__tests__/reservationPayment.contract.types.ts` |
| `src/v2/shared/api/__tests__/reservationPayments.test.mjs` | `src/v2/modules/booking/__tests__/reservationPayments.test.mjs` |
| `src/v2/shared/api/mock/features/reservation-payments/fixtures.ts` | `src/v2/modules/booking/reservations/mock/records/fixtures.ts + payments/mock (split by domain responsibility)` |
| `src/v2/shared/api/mock/features/reservation-payments/handlers.ts` | `src/v2/modules/booking/reservations/mock/records/handlers.ts + payments/mock (split by domain responsibility)` |
| `src/v2/shared/api/mock/features/reservations/__tests__/fixtures.test.ts` | `src/v2/modules/booking/reservations/mock/__tests__/fixtures.test.ts` |
| `src/v2/shared/api/mock/features/reservations/fixtures.ts` | `src/v2/modules/booking/reservations/mock/fixtures.ts` |
| `src/v2/shared/api/mock/features/reservations/handlers.ts` | `src/v2/modules/booking/reservations/mock/handlers.ts` |
| `src/v2/shared/i18n/__tests__/statusLabels.test.ts` | `src/v2/modules/booking/__tests__/statusLabels.test.ts` |

Shared `mock/fixtures.ts` Offer/Coupon fixtures moved to `offers-coupons/mock/fixtures.ts`;
merchant reservation fixtures moved to `reservations/mock/merchantFixtures.ts`.
The unreachable generic reservation/availability fallback branches were removed after their active
handlers moved; merchant fallback behavior is now in `merchantHandlers.ts`.
Two unreferenced availability fixtures (generic and Place exploration) were removed; the active
mixed GENERAL/TICKET/CLASS fixture is preserved. No tests or test assertions were removed.

New structural files: Booking root index; reservation route index; reservation error presentation;
reservation Place summary hook; payment API contract aliases; submodule mock indexes and Booking
mock registry composition. `routes` keeps route screens out of headless query imports.

## Production public API (exact named exports)

Only real production consumers determine these exports. Tests use explicit `__tests__/index.ts`
entries and never add production exports for spies. UI routes, headless reads, resources and mock
registration have separate entrypoints so Node and Voice query consumers do not load native UI.

### `src/v2/modules/booking/index.ts`

```ts
export type { AvailabilityList } from './reservations';
export { createAvailabilitiesQueryOptions, isSelectableAvailability, NEARBY_RESERVATION_CANDIDATE_LIMIT, useNearbyReservablePlaceIds, useReservations } from './reservations';
export type { PlaceAvailabilities } from './reservations';
export { usePlaceAvailabilities } from './reservations';
export { selectReservationCta, type ReservationCtaState } from './reservations';
```

### `src/v2/modules/booking/mock/index.ts`

```ts
import { reservationMockHandlers, reservationRecordMockHandlers, merchantReservationMockHandlers } from '../reservations/mock';
import { paymentMockHandlers } from '../payments/mock';
import { offerCouponMockHandlers } from '../offers-coupons/mock';

// Preserve availability priority and tourist-before-merchant fallback precedence.
export const bookingMockHandlers = [
  ...reservationMockHandlers,
  ...reservationRecordMockHandlers,
  ...paymentMockHandlers,
  ...merchantReservationMockHandlers,
  ...offerCouponMockHandlers,
];
```

### `src/v2/modules/booking/offers-coupons/i18n/index.ts`

```ts
export { offerCouponResources } from './offerCouponResources';
export { offerStatusResources } from './offerStatusResources';
```

### `src/v2/modules/booking/offers-coupons/index.ts`

```ts
export { default as PlaceCouponCta } from './components/PlaceCouponCta';
export { default as OfferCouponErrorState } from './components/OfferCouponErrorState';
export type { Coupon, CouponStatus, Offer } from './api/offerCouponApi';
export type { OfferIssuanceView } from './model/offerPresentation';
export { getOfferIssuanceView } from './model/offerPresentation';
export { canPresentCoupon, getCouponStatusView } from './model/couponPresentation';
export { CouponNotFoundError, createOfferQueryOptions, useCoupon, useCoupons, useInfiniteCoupons, useOffer, useOffers } from './hooks/useOffersCoupons';
```

### `src/v2/modules/booking/offers-coupons/mock/index.ts`

```ts
export { offerCouponMockHandlers } from './handlers';
```

### `src/v2/modules/booking/payments/i18n/index.ts`

```ts
export { paymentResources } from './paymentResources';
```

### `src/v2/modules/booking/payments/index.ts`

```ts
export { useAllPayments } from './hooks/usePayments';
export { getPaymentAmount, getPaymentStatusView } from './model/paymentPresentation';
```

### `src/v2/modules/booking/payments/mock/index.ts`

```ts
export { paymentMockHandlers } from './handlers';
```

### `src/v2/modules/booking/reservations/i18n/index.ts`

```ts
export { reservationResources } from './reservationResources';
```

### `src/v2/modules/booking/reservations/index.ts`

```ts
export type { AvailabilityList, Reservation } from './api/reservationApi';
export { createAvailabilitiesQueryOptions, useReservations } from './hooks/useReservations';
export { NEARBY_RESERVATION_CANDIDATE_LIMIT, useNearbyReservablePlaceIds } from './hooks/useNearbyReservablePlaceIds';
export { isSelectableAvailability } from './model/reservationProduct';
export type { PlaceAvailabilities } from './api/placeAvailabilityApi';
export { usePlaceAvailabilities } from './hooks/usePlaceAvailabilities';
export { selectReservationCta, type ReservationCtaState } from './model/placeAvailabilityPresentation';
```

### `src/v2/modules/booking/reservations/map-sheet/index.ts`

```ts
export { default as ReservationBottomSheet } from '../components/ReservationBottomSheet';
```

### `src/v2/modules/booking/reservations/mock/index.ts`

```ts
export { reservationMockHandlers } from './handlers';
export { reservationRecordMockHandlers } from './records/handlers';
export { merchantReservationMockHandlers } from './merchantHandlers';
```

### `src/v2/modules/booking/reservations/routes/index.ts`

```ts
export { default as CreateReservationScreen } from '../screens/CreateReservationScreen';
export { default as ReservationBoxScreen } from '../screens/ReservationBoxScreen';
export { default as ReservationDetailScreen } from '../screens/ReservationDetailScreen';
```

## Removed #359 exception inventory

| Source | Target | Rule | Allowed occurrences |
|---|---|---|---:|
| `src/v2/app/navigation/RootNavigator.tsx` | `src/v2/features/reservations/screens/CreateReservationScreen.tsx` | domain-public-api | 1 |
| `src/v2/app/navigation/RootNavigator.tsx` | `src/v2/features/reservations/screens/ReservationBoxScreen.tsx` | domain-public-api | 1 |
| `src/v2/app/navigation/RootNavigator.tsx` | `src/v2/features/reservations/screens/ReservationDetailScreen.tsx` | domain-public-api | 1 |
| `src/v2/features/reservations/screens/__tests__/ReservationScreens.test.tsx` | `src/v2/shared/api/index.ts` | screen-no-api | 1 |
| `src/v2/features/reservations/screens/__tests__/ReservationScreens.test.tsx` | `src/v2/features/payments/hooks/usePayments.ts` | domain-public-api | 1 |
| `src/v2/features/reservations/screens/CreateReservationScreen.tsx` | `src/v2/shared/api/index.ts` | screen-no-api | 1 |
| `src/v2/features/reservations/screens/ReservationDetailScreen.tsx` | `src/v2/features/payments/hooks/usePayments.ts` | domain-public-api | 1 |
| `src/v2/features/reservations/screens/ReservationDetailScreen.tsx` | `src/v2/features/payments/model/paymentPresentation.ts` | domain-public-api | 1 |
| `src/v2/shared/api/__tests__/offerPresentation.test.mjs` | `src/v2/features/offers-coupons/hooks/useOffersCoupons.ts` | shared-no-domain | 2 |
| `src/v2/shared/api/__tests__/offerPresentation.test.mjs` | `src/v2/features/offers-coupons/hooks/useOffersCoupons.ts` | domain-public-api | 2 |
| `src/v2/shared/api/__tests__/offerPresentation.test.mjs` | `src/v2/features/offers-coupons/model/offerPresentation.ts` | shared-no-domain | 1 |
| `src/v2/shared/api/__tests__/offerPresentation.test.mjs` | `src/v2/features/offers-coupons/model/offerPresentation.ts` | domain-public-api | 1 |
| `src/v2/shared/api/__tests__/reservationPayment.contract.types.ts` | `src/v2/features/payments/model/payment.types.ts` | shared-no-domain | 1 |
| `src/v2/shared/api/__tests__/reservationPayment.contract.types.ts` | `src/v2/features/payments/model/payment.types.ts` | domain-public-api | 1 |
| `src/v2/shared/api/__tests__/reservationPayment.contract.types.ts` | `src/v2/features/reservations/api/reservationApi.ts` | shared-no-domain | 1 |
| `src/v2/shared/api/__tests__/reservationPayment.contract.types.ts` | `src/v2/features/reservations/api/reservationApi.ts` | domain-public-api | 1 |
| `src/v2/shared/api/__tests__/reservationPayments.test.mjs` | `src/v2/features/payments/api/paymentApi.ts` | shared-no-domain | 1 |
| `src/v2/shared/api/__tests__/reservationPayments.test.mjs` | `src/v2/features/payments/api/paymentApi.ts` | domain-public-api | 1 |
| `src/v2/shared/api/__tests__/reservationPayments.test.mjs` | `src/v2/features/payments/hooks/usePayments.ts` | shared-no-domain | 1 |
| `src/v2/shared/api/__tests__/reservationPayments.test.mjs` | `src/v2/features/payments/hooks/usePayments.ts` | domain-public-api | 1 |
| `src/v2/shared/api/__tests__/reservationPayments.test.mjs` | `src/v2/features/payments/model/payment.types.ts` | shared-no-domain | 1 |
| `src/v2/shared/api/__tests__/reservationPayments.test.mjs` | `src/v2/features/payments/model/payment.types.ts` | domain-public-api | 1 |
| `src/v2/shared/api/__tests__/reservationPayments.test.mjs` | `src/v2/features/reservations/api/reservationApi.ts` | shared-no-domain | 1 |
| `src/v2/shared/api/__tests__/reservationPayments.test.mjs` | `src/v2/features/reservations/api/reservationApi.ts` | domain-public-api | 1 |
| `src/v2/shared/api/__tests__/reservationPayments.test.mjs` | `src/v2/features/reservations/hooks/useReservations.ts` | shared-no-domain | 1 |
| `src/v2/shared/api/__tests__/reservationPayments.test.mjs` | `src/v2/features/reservations/hooks/useReservations.ts` | domain-public-api | 1 |
| `src/v2/shared/i18n/__tests__/statusLabels.test.ts` | `src/v2/features/offers-coupons/index.ts` | shared-no-domain | 1 |
| `src/v2/shared/i18n/__tests__/statusLabels.test.ts` | `src/v2/features/payments/model/payment.types.ts` | shared-no-domain | 1 |
| `src/v2/shared/i18n/__tests__/statusLabels.test.ts` | `src/v2/features/payments/model/payment.types.ts` | domain-public-api | 1 |
| `src/v2/shared/i18n/__tests__/statusLabels.test.ts` | `src/v2/features/payments/model/paymentPresentation.ts` | shared-no-domain | 1 |
| `src/v2/shared/i18n/__tests__/statusLabels.test.ts` | `src/v2/features/payments/model/paymentPresentation.ts` | domain-public-api | 1 |
| `src/v2/shared/i18n/__tests__/statusLabels.test.ts` | `src/v2/features/reservations/model/reservationPresentation.ts` | shared-no-domain | 1 |
| `src/v2/shared/i18n/__tests__/statusLabels.test.ts` | `src/v2/features/reservations/model/reservationPresentation.ts` | domain-public-api | 1 |
| `src/v2/shared/i18n/__tests__/statusLabels.test.ts` | `src/v2/features/reservations/i18n/reservationResources.ts` | shared-no-domain | 1 |
| `src/v2/shared/i18n/__tests__/statusLabels.test.ts` | `src/v2/features/reservations/i18n/reservationResources.ts` | domain-public-api | 1 |

## Place availability ownership extraction

| Before | After |
|---|---|
| place/detail/api/placeDetailApi.ts getPlaceAvailabilities | booking/reservations/api/placeAvailabilityApi.ts |
| place/detail/model/placeDetail.types.ts PlaceAvailabilities | booking/reservations/api/placeAvailabilityApi.ts (unchanged generated alias) |
| place/detail/hooks/usePlaceDetail.ts availability functions | booking/reservations/hooks/usePlaceAvailabilities.ts |
| place/core/placeQueryKeys.ts availability key | booking/reservations/model/placeAvailabilityQueryKeys.ts (same tuple) |
| place/detail/model/placeDetailPresentation.ts reservation CTA state/selector | booking/reservations/model/placeAvailabilityPresentation.ts |
| place/detail/__tests__/placeDetailPresentation.test.mjs two standalone availability tests | booking/__tests__/placeAvailability.test.mjs (same assertions) |
| shared/i18n/resources.ts offer/payment status copy | booking/offers-coupons/i18n/offerStatusResources.ts and booking/payments/i18n/paymentResources.ts |

Paths in this table are relative to `src/v2/modules`, except the shared i18n path relative to `src/v2`.
Place consumes the Booking public type/hook/selector and retains only its screen/sheet composition.
App preserves the former status-resource key insertion order before My Page; the original whole-catalog
SHA assertion passes unchanged. No generated contract, locale key/value or query identity changes.
