import { useMemo } from 'react';
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

export function getInlineRegistrantUsername(place: RecommendedPlace) {
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

/** Registrant names come directly from the place response. */
export function usePlaceRegistrantUsernames(places: RecommendedPlace[]) {
  return useMemo(() => {
    const isLoadingByPlaceId: Record<string, boolean> = {};
    const usernamesByPlaceId: Record<string, string> = {};

    places.forEach((place) => {
      const placeKey = String(place.id);
      const username = getInlineRegistrantUsername(place);

      if (username) {
        usernamesByPlaceId[placeKey] = username;
      }

      isLoadingByPlaceId[placeKey] = false;
    });

    return {
      isLoadingByPlaceId,
      usernamesByPlaceId,
    };
  }, [places]);
}
