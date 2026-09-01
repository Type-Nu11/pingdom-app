import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  createOfferQueryOptions,
  type Coupon,
  type Offer,
} from '../../offers-coupons';
import { createPlaceDetailQueryOptions, type PlaceDetail } from '../../place-detail';
import { toCouponBoxEntries } from '../model/couponBoxEntries';

type CouponBoxFallback = Readonly<{
  description: string;
  title: string;
}>;

/**
 * The current Coupon response only contains coupon lifecycle data and an
 * offerId. Resolve optional presentation data through the existing Offer and
 * Place query boundaries; failed or closed resources remain safe fallbacks.
 */
export function useCouponBoxEntries(
  coupons: readonly Coupon[],
  fallback: CouponBoxFallback,
) {
  const offerIds = useMemo(
    () => [...new Set(coupons.map((coupon) => coupon.offerId))],
    [coupons],
  );
  const offerQueries = useQueries({
    queries: offerIds.map((offerId) => createOfferQueryOptions(offerId)),
  });
  const offersById = useMemo(() => {
    const offers = new Map<number, Offer>();
    offerQueries.forEach((query, index) => {
      if (query.data) offers.set(offerIds[index], query.data);
    });
    return offers;
  }, [offerIds, offerQueries]);

  const placeIds = useMemo(
    () => [...new Set(
      [...offersById.values()]
        .map((offer) => offer.placeId)
        .filter((placeId): placeId is number => typeof placeId === 'number'),
    )],
    [offersById],
  );
  const placeQueries = useQueries({
    queries: placeIds.map((placeId) => createPlaceDetailQueryOptions(placeId)),
  });
  const placesById = useMemo(() => {
    const places = new Map<number, PlaceDetail>();
    placeQueries.forEach((query, index) => {
      if (query.data) places.set(placeIds[index], query.data);
    });
    return places;
  }, [placeIds, placeQueries]);

  return useMemo(
    () => toCouponBoxEntries(coupons, { offersById, placesById }, fallback),
    [coupons, fallback, offersById, placesById],
  );
}
