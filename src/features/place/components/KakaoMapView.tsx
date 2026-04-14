// components/KakaoMapView.tsx
import { requireNativeComponent, ViewProps } from 'react-native';

export type KakaoMapViewProps = ViewProps & {
  centerLat: number;
  centerLng: number;
  zoomLevel?: number;
};

export default requireNativeComponent<KakaoMapViewProps>('KakaoMapView');
