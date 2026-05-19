export type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
};

export type HotPlace = {
  id: string;
  location: string;
  rank: number;
  username: string;
};
