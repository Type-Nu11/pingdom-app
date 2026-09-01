import { useMemo } from 'react';

import {
  getOfferIssuanceView,
  useOffers,
  type Offer,
  type OfferIssuanceView,
} from '../../offers-coupons';

export type PlaceOfferCtaState =
  | Readonly<{ kind: 'loading' }>
  | Readonly<{ kind: 'error' }>
  /** The place has no issuable offer. A normal state, not a failure. */
  | Readonly<{ kind: 'none' }>
  | Readonly<{ issuance: OfferIssuanceView; kind: 'ready'; offer: Offer }>;

/**
 * The issuable offer behind a place's coupon CTA.
 *
 * `GET /offers?placeId=` already returns only offers the tourist may be issued,
 * so the first row is the one the CTA speaks for. Everything the button needs —
 * label, enabled state, remaining stock, policy copy — comes from the shared
 * `getOfferIssuanceView` selector, so the place CTA, the coupon box, and the
 * reservation screens read the same server states the same way.
 *
 * Whether issuing actually succeeds stays the server's answer to
 * `POST /offers/{id}/coupons`; nothing here inspects the tourist's coupons.
 */
export function usePlaceOfferCta(placeId: number, now: string): PlaceOfferCtaState {
  const offersQuery = useOffers({ limit: 1, placeId });
  const offer = offersQuery.data?.offers?.[0];

  const issuance = useMemo(
    () => (offer === undefined ? undefined : getOfferIssuanceView(offer, now)),
    [now, offer],
  );

  if (offersQuery.isPending) {
    return { kind: 'loading' };
  }

  if (offersQuery.isError) {
    return { kind: 'error' };
  }

  if (offer === undefined || issuance === undefined) {
    return { kind: 'none' };
  }

  return { issuance, kind: 'ready', offer };
}
