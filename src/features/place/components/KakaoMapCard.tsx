// components/KakaoMapCard.tsx
import { requireNativeComponent, ViewProps } from 'react-native';

export type KakaoMapCardProps = ViewProps & {
  centerLat: number;
  centerLng: number;
  zoomLevel?: number;

  userLat?: number;
  userLng?: number;
  followUser?: boolean;
  markers?: Array<{
    category: 'fashion' | 'food' | 'game' | 'music';
    id: string;
    lat: number;
    lng: number;
    markerType?: 'default' | 'hot';
  }>;
};

export default requireNativeComponent<KakaoMapCardProps>('KakaoMapView');
