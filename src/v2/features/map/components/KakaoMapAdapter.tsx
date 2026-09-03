import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import styled from 'styled-components/native';

import KakaoMapNativeView, {
  type KakaoMapNativeMarker,
} from '../../../shared/native/KakaoMapNativeView';
import type { Coordinate } from '../model/map.types';

export type KakaoMapAdapterProps = {
  center: Coordinate;
  followUser?: boolean;
  markers: KakaoMapNativeMarker[];
  onCameraIdle?: (coordinate: Coordinate) => void;
  onMarkerSelect?: (markerId: string) => void;
  style?: StyleProp<ViewStyle>;
  userCoordinate?: Coordinate;
  zoomLevel?: number;
};

const MapView = styled(KakaoMapNativeView)`
  flex: 1;
`;

export default function KakaoMapAdapter({
  center,
  followUser = false,
  markers,
  onCameraIdle,
  onMarkerSelect,
  style,
  userCoordinate,
  zoomLevel = 4,
}: KakaoMapAdapterProps) {
  return (
    <MapView
      centerLat={center.lat}
      centerLng={center.lng}
      followUser={followUser}
      markers={markers}
      onCameraIdle={(event) => onCameraIdle?.(event.nativeEvent)}
      onMarkerPress={(event) => onMarkerSelect?.(event.nativeEvent.markerId)}
      style={style}
      testID="v2-kakao-map"
      userLat={userCoordinate?.lat}
      userLng={userCoordinate?.lng}
      zoomLevel={zoomLevel}
    />
  );
}
