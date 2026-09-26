import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import styled from 'styled-components/native';

import NaverMapNativeView, {
  type NaverMapNativeMarker,
} from '../../../../../shared/native/NaverMapNativeView';
import type { Coordinate } from '../../camera/model/map.types';

export type NaverMapAdapterProps = {
  center: Coordinate;
  followUser?: boolean;
  markers: NaverMapNativeMarker[];
  onCameraIdle?: (coordinate: Coordinate) => void;
  onMarkerSelect?: (markerId: string) => void;
  style?: StyleProp<ViewStyle>;
  userCoordinate?: Coordinate;
  zoomLevel?: number;
};

const MapView = styled(NaverMapNativeView)`
  flex: 1;
`;

/**
 * V2의 좌표 객체를 네이티브 브리지가 받는 centerLat/centerLng 등의 props로 풀어 전달한다.
 * 반대로 SDK의 카메라 이동·마커 터치 이벤트는 nativeEvent에서 꺼내 화면 콜백에 전달한다.
 * 지도 타일은 네이티브 SDK가 표시하며, 장소 검색/주소 변환 API는 이 어댑터와 별개다.
 */
export default function NaverMapAdapter({
  center,
  followUser = false,
  markers,
  onCameraIdle,
  onMarkerSelect,
  style,
  userCoordinate,
  zoomLevel = 17,
}: NaverMapAdapterProps) {
  return (
    <MapView
      centerLat={center.lat}
      centerLng={center.lng}
      followUser={followUser}
      markers={markers}
      onCameraIdle={(event) => onCameraIdle?.(event.nativeEvent)}
      onMarkerPress={(event) => onMarkerSelect?.(event.nativeEvent.markerId)}
      style={style}
      testID="v2-naver-map"
      userLat={userCoordinate?.lat}
      userLng={userCoordinate?.lng}
      zoomLevel={zoomLevel}
    />
  );
}
