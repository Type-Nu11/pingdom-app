import {
  type NativeSyntheticEvent,
  requireNativeComponent,
  type ViewProps,
} from 'react-native';

export type KakaoMapCameraIdleEvent = NativeSyntheticEvent<{
  lat: number;
  lng: number;
}>;

export type KakaoMapMarkerPressEvent = NativeSyntheticEvent<{
  markerId: string;
}>;

export type KakaoMapNativeMarker = {
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

export type KakaoMapNativeViewProps = ViewProps & {
  centerLat: number;
  centerLng: number;
  followUser?: boolean;
  markers?: KakaoMapNativeMarker[];
  onCameraIdle?: (event: KakaoMapCameraIdleEvent) => void;
  onMarkerPress?: (event: KakaoMapMarkerPressEvent) => void;
  userLat?: number;
  userLng?: number;
  zoomLevel?: number;
};

/**
 * KakaoMapView must be registered exactly once in the JavaScript bundle.
 * V1 compatibility callers and V2 adapters share this native host component.
 */
const KakaoMapNativeView = requireNativeComponent<KakaoMapNativeViewProps>('KakaoMapView');

export default KakaoMapNativeView;
