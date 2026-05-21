export type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
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
