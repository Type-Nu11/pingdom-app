import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { recordApi } from '../../record/api/recordApi';
import { postQueryKeys } from '../../record/hooks/usePlacePosts';
import type { Post } from '../../record/model/record.types';
import type { RecommendedPlace } from '../model/place.types';

type PlaceWithRegistrantAliases = RecommendedPlace & {
  createdByUsername?: string;
  creatorName?: string;
  ownerName?: string;
  placeUsername?: string;
  registrantName?: string;
  registrantUsername?: string;
  userName?: string;
  username?: string;
};

function getInlineRegistrantUsername(place: RecommendedPlace) {
  const placeWithAliases = place as PlaceWithRegistrantAliases;

  return (
    placeWithAliases.username
    ?? placeWithAliases.userName
    ?? placeWithAliases.registrantUsername
    ?? placeWithAliases.registrantName
    ?? placeWithAliases.placeUsername
    ?? placeWithAliases.createdByUsername
    ?? placeWithAliases.creatorName
    ?? placeWithAliases.ownerName
  );
}

function getFirstRegistrantUsername(posts: Post[]) {
  const firstPost = posts.reduce<Post | null>((oldestPost, post) => {
    if (!oldestPost) {
      return post;
    }

    return new Date(post.createdAt).getTime() < new Date(oldestPost.createdAt).getTime()
      ? post
      : oldestPost;
  }, null);

  return firstPost?.username;
}

export function usePlaceRegistrantUsernames(places: RecommendedPlace[]) {
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
    const isLoadingByPlaceId: Record<string, boolean> = {};
    const usernamesByPlaceId: Record<string, string> = {};

    places.forEach((place) => {
      const username = getInlineRegistrantUsername(place);

      if (username) {
        usernamesByPlaceId[String(place.id)] = username;
      }
    });

    registrantQueries.forEach((query, index) => {
      const placeId = placeIds[index];
      const placeKey = String(placeId);

      if (usernamesByPlaceId[placeKey] !== undefined) {
        return;
      }

      const username = getFirstRegistrantUsername(
        query.data?.posts.filter((post) => Number(post.placeId) === placeId) ?? []
      );

      if (username) {
        usernamesByPlaceId[placeKey] = username;
      }

      isLoadingByPlaceId[placeKey] = query.isLoading;
    });

    return {
      isLoadingByPlaceId,
      usernamesByPlaceId,
    };
  }, [placeIds, places, registrantQueries]);
}

