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
