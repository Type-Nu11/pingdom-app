import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { recordApi } from '../../record/api/recordApi';
import { postQueryKeys } from '../../record/hooks/usePlacePosts';
import type { Post } from '../../record/model/record.types';
import type { RecommendedPlace } from '../model/place.types';

type PlaceWithRegistrantAliases = RecommendedPlace & {
  createdBy?: number;
  createdByUserId?: number;
  creatorId?: number;
  ownerId?: number;
  placeUserId?: number;
  registrantId?: number;
  user_id?: number;
};

function getInlineRegistrantId(place: RecommendedPlace) {
  const placeWithAliases = place as PlaceWithRegistrantAliases;

  return (
    placeWithAliases.userId
    ?? placeWithAliases.registrantId
    ?? placeWithAliases.placeUserId
    ?? placeWithAliases.createdByUserId
    ?? placeWithAliases.creatorId
    ?? placeWithAliases.createdBy
    ?? placeWithAliases.ownerId
    ?? placeWithAliases.user_id
  );
}

function getFirstRegistrantId(posts: Post[]) {
  const firstPost = posts.reduce<Post | null>((oldestPost, post) => {
    if (!oldestPost) {
      return post;
    }

    return new Date(post.createdAt).getTime() < new Date(oldestPost.createdAt).getTime()
      ? post
      : oldestPost;
  }, null);

  return firstPost?.userId;
}

export function usePlaceRegistrantIds(places: RecommendedPlace[]) {
  const placeIds = useMemo(
    () => places
      .map((place) => Number(place.id))
      .filter((placeId) => Number.isFinite(placeId)),
    [places]
  );
  const registrantQueries = useQueries({
    queries: placeIds.map((placeId) => {
      const queryParams = {
        limit: 100,
        page: 1,
        placeId,
      };

      return {
        enabled: Number.isFinite(placeId),
        queryFn: () => recordApi.getPosts(queryParams),
        queryKey: postQueryKeys.place(placeId, queryParams),
        staleTime: 30_000,
      };
    }),
  });

  return useMemo(() => {
    const registrantIdsByPlaceId: Record<string, number> = {};
    const isLoadingByPlaceId: Record<string, boolean> = {};

    places.forEach((place) => {
      const registrantId = getInlineRegistrantId(place);

      if (registrantId !== undefined) {
        registrantIdsByPlaceId[String(place.id)] = registrantId;
      }
    });

    registrantQueries.forEach((query, index) => {
      const placeId = placeIds[index];
      const placeKey = String(placeId);

      if (registrantIdsByPlaceId[placeKey] !== undefined) {
        return;
      }

      const registrantId = getFirstRegistrantId(
        query.data?.posts.filter((post) => Number(post.placeId) === placeId) ?? []
      );

      if (registrantId !== undefined) {
        registrantIdsByPlaceId[placeKey] = registrantId;
      }

      isLoadingByPlaceId[placeKey] = query.isLoading;
    });

    return {
      isLoadingByPlaceId,
      registrantIdsByPlaceId,
    };
  }, [placeIds, places, registrantQueries]);
}
