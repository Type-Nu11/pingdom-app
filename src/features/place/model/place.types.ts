export type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export type PlaceCreateDraft = {
  address: string;
  latitude: number;
  longitude: number;
  name: string;
};

export type PlaceUploadPhoto = {
  assetId?: string;
  name?: string;
  type?: string;
  uri: string;
};

export type PlaceLibraryPhoto = {
  filename: string;
  id: string;
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

export type MarkerPreviewFeedItem = {
  caption: string;
  id: string;
  likeCount: string;
  placeName: string;
  postedAt: string;
  username: string;
};

export type MarkerPreview = {
  firstRegistrant: string;
  feeds: MarkerPreviewFeedItem[];
  id: string;
  locationLabel: string;
  title: string;
  updates: string[];
};
