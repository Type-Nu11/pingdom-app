export type Coordinate = {
  lat: number;
  lng: number;
};

export type MapMarkerCategory = 'etc' | 'fashion' | 'food' | 'game' | 'music';
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
