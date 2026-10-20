import type { PlaceCategory } from '../../../core';

export type MapMarker = {
  category: PlaceCategory;
  id: string;
  lat: number;
  lng: number;
  markerType?: 'default' | 'hot' | 'search';
};
