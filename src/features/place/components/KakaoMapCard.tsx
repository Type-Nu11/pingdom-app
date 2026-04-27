// components/KakaoMapCard.tsx
import { requireNativeComponent, ViewProps } from 'react-native';

export type KakaoMapCardProps = ViewProps & {
  centerLat: number;
  centerLng: number;
  zoomLevel?: number;
};

export default requireNativeComponent<KakaoMapCardProps>('KakaoMapView');
