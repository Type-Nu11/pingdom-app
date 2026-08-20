// components/KakaoMapCard.tsx
import { NativeSyntheticEvent, requireNativeComponent, ViewProps } from 'react-native';

export type KakaoMapCameraIdleEvent = NativeSyntheticEvent<{
  lat: number;
  lng: number;
}>;

export type KakaoMapMarkerPressEvent = NativeSyntheticEvent<{
  markerId: string;
}>;

export type KakaoMapCameraMoveStartEvent = NativeSyntheticEvent<Record<string, never>>;

export type KakaoMapCardProps = ViewProps & {
  centerLat: number;
  centerLng: number;
  zoomLevel?: number;

  userLat?: number;
  userLng?: number;
  followUser?: boolean;
  onCameraIdle?: (event: KakaoMapCameraIdleEvent) => void;
  onCameraMoveStart?: (event: KakaoMapCameraMoveStartEvent) => void;
  onMarkerPress?: (event: KakaoMapMarkerPressEvent) => void;
  markers?: Array<{
    category: 'etc' | 'fashion' | 'food' | 'game' | 'music';
    id: string;
    lat: number;
    lng: number;
    markerType?: 'default' | 'hot' | 'search';
  }>;
};

export default requireNativeComponent<KakaoMapCardProps>('KakaoMapView');
