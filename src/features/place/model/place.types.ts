export type Place = {
  address?: string;
  id: string;
  latitude?: number;
  longitude?: number;
  name: string;
  lat: number;
  lng: number;
  registrant?: string;
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
  imageUrls?: string[];
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
  lat: number;
  locationLabel: string;
  lng: number;
  title: string;
  updates: string[];
};
