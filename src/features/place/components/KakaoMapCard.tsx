// V1 compatibility re-export. The native view is registered once in the V2/shared boundary.
export { default } from '../../../v2/shared/native/KakaoMapNativeView';
export type {
  KakaoMapCameraIdleEvent,
  KakaoMapMarkerPressEvent,
  KakaoMapNativeViewProps as KakaoMapCardProps,
} from '../../../v2/shared/native/KakaoMapNativeView';
