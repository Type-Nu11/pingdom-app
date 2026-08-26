import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useInfiniteCheckIns, type LocationCheckInListItem } from '../../check-ins';
import {
  createPlaceCardQueryOptions,
  createPlaceExplorationMediaQueryOptions,
} from '../../place-exploration/hooks/usePlaceExploration';
import type {
  PlaceCard,
  PlaceExplorationMedia,
} from '../../place-exploration/model/placeExploration.types';
import {
  selectCandidateImageUrls,
  uniquePlaceIdsInServerOrder,
} from '../model/visitVerification';

const PAGE_LIMIT = 20;

export type VisitVerificationCandidate = {
  address: string;
  category: string | null;
  checkInId: number;
  distanceMeters: number;
  error: unknown;
  imageUrls: string[];
  name: string;
  placeId: number;
  retry: () => void;
  status: 'error' | 'loading' | 'ready';
};

export function useVisitVerificationCandidates() {
  const checkInsQuery = useInfiniteCheckIns(PAGE_LIMIT);
  const checkIns = useMemo(
    () => checkInsQuery.data?.pages.flatMap((page) => page.checkIns ?? []) ?? [],
    [checkInsQuery.data?.pages],
  );
  // Preserve the server's check-in order and every check-in ID because the server does not
  // publish a same-place eligibility policy. Stable place keys deduplicate enrichment requests.
  const placeIds = useMemo(
    () => uniquePlaceIdsInServerOrder(checkIns),
    [checkIns],
  );
  const cardQueries = useQueries({
    queries: placeIds.map((placeId) => createPlaceCardQueryOptions(placeId)),
  });
  const mediaQueries = useQueries({
    queries: placeIds.map((placeId) => createPlaceExplorationMediaQueryOptions(placeId)),
  });

  const candidates = checkIns.map((checkIn: LocationCheckInListItem): VisitVerificationCandidate => {
    const queryIndex = placeIds.indexOf(checkIn.placeId);
    const cardQuery = cardQueries[queryIndex];
    const mediaQuery = mediaQueries[queryIndex];
    const card = cardQuery?.data;
    const error = cardQuery?.error ?? mediaQuery?.error;
    const retry = () => {
      void cardQuery?.refetch();
      void mediaQuery?.refetch();
    };

    if (cardQuery?.isError) {
      return {
        address: '', category: null, checkInId: checkIn.id,
        distanceMeters: checkIn.distanceMeters, error, imageUrls: [], name: '',
        placeId: checkIn.placeId, retry, status: 'error',
      };
    }
    if (!card) {
      return {
        address: '', category: null, checkInId: checkIn.id,
        distanceMeters: checkIn.distanceMeters, error: null, imageUrls: [], name: '',
        placeId: checkIn.placeId, retry, status: 'loading',
      };
    }

    return {
      address: card.roadAddress ?? card.address,
      category: card.category ?? card.touristCategories[0] ?? null,
      checkInId: checkIn.id,
      distanceMeters: checkIn.distanceMeters,
      error,
      imageUrls: selectCandidateImageUrls(card.imageUrl, mediaQuery?.data?.media ?? []),
      name: card.name,
      placeId: checkIn.placeId,
      retry,
      status: 'ready',
    };
  });

  return {
    candidates,
    checkInsQuery,
  };
}
