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
  nightMode?: boolean;
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
 *
 * 'NaverMapView'는 Android NaverMapViewManager.getName()과 iOS 매니저의 moduleName()에
 * 등록된 이름이다. React Native가 현재 플랫폼의 뷰를 생성하고 위 props/이벤트를 연결한다.
 * SDK 설치와 매니저 등록은 네이티브 빌드에 포함되므로 새로 연결할 때 앱 재빌드가 필요하다.
 */
const NaverMapNativeView = requireNativeComponent<NaverMapNativeViewProps>('NaverMapView');

export default NaverMapNativeView;
