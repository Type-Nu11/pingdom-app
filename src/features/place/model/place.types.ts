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
  placeGrowth: PlaceGrowth;
  reason: string;
  userId?: number;
};

export type PlaceRecommendations = {
  appliedRadiusKm: number;
  limit: number;
  places: RecommendedPlace[];
  recommendationRequestId: string;
  recommendedCount: number;
  recommendationVersion: string;
  requestedRadiusKm: number;
};

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
