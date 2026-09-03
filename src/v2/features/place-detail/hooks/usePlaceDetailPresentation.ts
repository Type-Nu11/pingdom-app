import { useQuery } from '@tanstack/react-query';

import {
  usePlaceCard,
  usePlaceExplorationMedia,
  usePlaceOperatingNotices,
  usePlaceVisitDecision,
} from '../../place-exploration/hooks/usePlaceExploration';
import { createPlaceReviewsQueryOptions } from '../../place-visit-verification/hooks/usePlaceReviews';
import {
  buildPlaceDetailPresentation,
  type ResourceState,
} from '../model/placeDetailPresentation';
import { usePlaceAvailabilities, usePlaceDetail, usePlaceMenus } from './usePlaceDetail';

const asResource = <T,>(query: {
  data?: T;
  error: unknown;
  isError: boolean;
  isPending: boolean;
}): ResourceState<T> => ({
  data: query.data,
  error: query.error,
  isError: query.isError,
  isPending: query.isPending,
});

export function usePlaceDetailPresentation(
  placeId: number,
  { enabled = true }: { enabled?: boolean } = {},
) {
  const active = enabled && Number.isFinite(placeId) && placeId > 0;
  const detail = usePlaceDetail(placeId, { enabled: active });
  const card = usePlaceCard(placeId, { enabled: active });
  const visitDecision = usePlaceVisitDecision(placeId, { enabled: active });
  const notices = usePlaceOperatingNotices(placeId, { enabled: active });
  const media = usePlaceExplorationMedia(placeId, { enabled: active });
  const menus = usePlaceMenus(placeId, { enabled: active });
  const availabilities = usePlaceAvailabilities(placeId, { enabled: active });
  const reviews = useQuery({
    ...createPlaceReviewsQueryOptions(placeId, { page: 1, limit: 20 }),
    enabled: active,
  });

  const presentation = active ? buildPlaceDetailPresentation(placeId, {
    availabilities: asResource(availabilities),
    card: asResource(card),
    detail: asResource(detail),
    media: asResource(media),
    menus: asResource(menus),
    notices: asResource(notices),
    reviews: asResource(reviews),
    visitDecision: asResource(visitDecision),
  }) : null;

  return {
    presentation,
    refetchAvailability: availabilities.refetch,
    refetchMedia: media.refetch,
    refetchMenus: menus.refetch,
    refetchReviews: reviews.refetch,
  };
}
