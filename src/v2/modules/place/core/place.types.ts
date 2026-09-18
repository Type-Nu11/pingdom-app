import type { PlaceExplorationSchema } from '../../../shared/api';

export type Place = {
  address: string;
  category?: string;
  distanceMeters?: number;
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  userId?: number;
  username?: string;
};

export type PlacesPage = {
  hasNext: boolean;
  limit: number;
  page: number;
  places: Place[];
  totalCount: number;
  totalPages: number;
};

type PlaceRecommendationContract = PlaceExplorationSchema<'PlaceRecommendationItem'>;

/** Map-safe view created only after validating the optional OpenAPI response fields. */
export type RecommendedPlace = PlaceRecommendationContract
  & Required<Pick<Place, 'address' | 'id' | 'latitude' | 'longitude' | 'name'>>
  & Pick<Place, 'category' | 'userId' | 'username'>;

export function selectUsableRecommendedPlaces(
  places?: readonly PlaceRecommendationContract[] | null,
): RecommendedPlace[] {
  return (places ?? []).flatMap((place) => {
    if (
      typeof place.id !== 'number'
      || !Number.isFinite(place.id)
      || typeof place.latitude !== 'number'
      || !Number.isFinite(place.latitude)
      || typeof place.longitude !== 'number'
      || !Number.isFinite(place.longitude)
    ) {
      return [];
    }

    return [{
      ...place,
      address: place.address ?? '',
      id: place.id,
      latitude: place.latitude,
      longitude: place.longitude,
      name: place.name ?? '',
    }];
  });
}

export type TravelPurpose =
  | 'K_POP'
  | 'BEAUTY'
  | 'FASHION'
  | 'CAFE'
  | 'FOOD'
  | 'POP_UP'
  | 'EXHIBITION'
  | 'NIGHTLIFE'
  | 'OTHER';

export type ActivityIntent =
  | 'EXPLORE'
  | 'EAT'
  | 'CAFE'
  | 'SHOP'
  | 'ATTEND_EVENT'
  | 'NIGHTLIFE';

export type RecommendationLimitReason =
  | 'REQUEST_LIMIT_CLAMPED'
  | 'RADIUS_EXPANDED'
  | 'OPERATING_STATUS_PRIORITY'
  | 'INTERACTED_PLACE_EXCLUDED'
  | 'FALLBACK_CANDIDATE_POOL';

export type PlaceCategory =
  | 'art'
  | 'beauty'
  | 'cafe'
  | 'etc'
  | 'fashion'
  | 'food'
  | 'game'
  | 'heritage'
  | 'music'
  | 'popup';
