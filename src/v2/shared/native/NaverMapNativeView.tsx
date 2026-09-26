import {
  type NativeSyntheticEvent,
  type HostComponent,
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
  /** 앱의 최종 테마가 dark이면 true. 양쪽 네이티브 브리지에서 Navi + 야간 모드로 반영한다. */
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
// Fast Refresh는 이 파일을 다시 실행해도 RN의 뷰 등록 정보를 유지한다.
// 같은 JS 런타임에서는 최초 생성한 호스트를 재사용해 중복 등록을 막는다.
// 앱 전체 Reload 시에는 런타임과 캐시가 함께 초기화된다.
const nativeMapRuntime = globalThis as typeof globalThis & {
  __pingdomNaverMapHost?: HostComponent<NaverMapNativeViewProps>;
};
const NaverMapNativeView = nativeMapRuntime.__pingdomNaverMapHost ?? (
  nativeMapRuntime.__pingdomNaverMapHost = requireNativeComponent<NaverMapNativeViewProps>('NaverMapView')
);

export default NaverMapNativeView;
