import { requireNativeComponent, ViewProps } from 'react-native';

type KakaoMapViewProps = ViewProps & {
  centerLat: number;
  centerLng: number;
  zoomLevel?: number;
};

const NativeKakaoMapView = requireNativeComponent<KakaoMapViewProps>('KakaoMapView');

export default NativeKakaoMapView;
