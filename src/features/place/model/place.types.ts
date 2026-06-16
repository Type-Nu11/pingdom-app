export type Place = {
  address: string;
  id: number;
  latitude: number;
  longitude: number;
  name: string;
};

export type PlacesPage = {
  hasNext: boolean;
  limit: number;
  page: number;
  places: Place[];
  totalCount: number;
  totalPages: number;
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

export type MapMarker = {
  category: 'fashion' | 'food' | 'game' | 'music';
  id: string;
  lat: number;
  lng: number;
  markerType?: 'default' | 'hot';
};

export type HotPlace = {
  id: string;
  location: string;
  rank: number;
  username: string;
};
