// components/KakaoMapCard.tsx
import { requireNativeComponent, ViewProps } from 'react-native';

export type KakaoMapCardProps = ViewProps & {
  centerLat: number;
  centerLng: number;
  zoomLevel?: number;

  userLat?: number;
  userLng?: number;
  followUser?: boolean;
};

export default requireNativeComponent<KakaoMapCardProps>('KakaoMapView');
