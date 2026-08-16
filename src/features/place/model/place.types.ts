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

export type PlaceGrowth = {
  currentLevelMinPhotoCount: number;
  level: number;
  nextLevelMinPhotoCount: number;
  photoCount: number;
  progressPercent: number;
};

export type RecommendedPlace = Place & {
  distanceMeters: number;
  boosted?: boolean;
  currentlyOperating?: boolean | null;
  hasActiveBenefit?: boolean;
  placeGrowth?: PlaceGrowth;
  reason?: string;
  reasonCode?: string;
  reservable?: boolean;
  userId?: number;
};

export type PlaceRecommendations = {
  appliedActivityIntent?: ActivityIntent | null;
  appliedRadiusKm?: number;
  appliedTravelPurposes?: TravelPurpose[];
  limit?: number;
  limitReasons?: RecommendationLimitReason[];
  places?: RecommendedPlace[];
  recommendationRequestId?: string;
  recommendedCount?: number;
  recommendationVersion?: string;
  requestedRadiusKm?: number;
};

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

export type PlaceCreateDraft = {
  address: string;
  coordinateToken?: string;
  kakaoPlaceId?: string;
  latitude: number;
  longitude: number;
  name: string;
};

export type PlaceUploadPhoto = {
  name?: string;
  type?: string;
  uri: string;
};

export type PlaceCategory = 'etc' | 'fashion' | 'food' | 'game' | 'music';

export type MapMarker = {
  bookmarked?: boolean;
  category: PlaceCategory;
  id: string;
  lat: number;
  lng: number;
  markerType?: 'default' | 'hot' | 'search';
};
