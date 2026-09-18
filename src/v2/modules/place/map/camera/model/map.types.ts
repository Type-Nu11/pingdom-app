export type Coordinate = {
  accuracyMeters?: number;
  lat: number;
  lng: number;
  observedAt?: string;
};

export type MapMarkerCategory =
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
export type MapMarkerType = 'default' | 'hot' | 'search';

export type MapMarker = Coordinate & {
  category: MapMarkerCategory;
  id: string;
  markerType?: MapMarkerType;
  name: string;
};

export type LocationState =
  | { status: 'loading'; coordinate: null; canAskAgain: true }
  | { status: 'granted'; coordinate: Coordinate; canAskAgain: true }
  | { status: 'denied'; coordinate: null; canAskAgain: boolean }
  | { status: 'failed'; coordinate: null; canAskAgain: true };
