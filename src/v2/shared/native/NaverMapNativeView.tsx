import {
  type NativeSyntheticEvent,
  requireNativeComponent,
  type ViewProps,
} from 'react-native';

export type NaverMapCameraIdleEvent = NativeSyntheticEvent<{
  lat: number;
  lng: number;
}>;

export type NaverMapMarkerPressEvent = NativeSyntheticEvent<{
  markerId: string;
}>;

export type NaverMapNativeMarker = {
  category:
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
  id: string;
  lat: number;
  lng: number;
  markerType?: 'default' | 'hot' | 'search';
};

export type NaverMapNativeViewProps = ViewProps & {
  centerLat: number;
  centerLng: number;
  followUser?: boolean;
  markers?: NaverMapNativeMarker[];
  onCameraIdle?: (event: NaverMapCameraIdleEvent) => void;
  onMarkerPress?: (event: NaverMapMarkerPressEvent) => void;
  userLat?: number;
  userLng?: number;
  zoomLevel?: number;
};

/**
 * NaverMapView must be registered exactly once in the JavaScript bundle.
 * The V2 adapter owns this native host component.
 */
const NaverMapNativeView = requireNativeComponent<NaverMapNativeViewProps>('NaverMapView');

export default NaverMapNativeView;
