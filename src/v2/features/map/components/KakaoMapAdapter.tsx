import React from 'react';
import styled from 'styled-components/native';

import KakaoMapNativeView from '../../../shared/native/KakaoMapNativeView';
import type { Coordinate, MapMarker } from '../model/map.types';

export type KakaoMapAdapterProps = {
  center: Coordinate;
  followUser?: boolean;
  markers: MapMarker[];
  onCameraIdle?: (coordinate: Coordinate) => void;
  onMarkerSelect?: (markerId: string) => void;
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
  userCoordinate,
  zoomLevel = 4,
}: KakaoMapAdapterProps) {
  return (
    <MapView
      centerLat={center.lat}
      centerLng={center.lng}
      followUser={followUser}
      markers={markers.map(({ name: _name, ...marker }) => marker)}
      onCameraIdle={(event) => onCameraIdle?.(event.nativeEvent)}
      onMarkerPress={(event) => onMarkerSelect?.(event.nativeEvent.markerId)}
      testID="v2-kakao-map"
      userLat={userCoordinate?.lat}
      userLng={userCoordinate?.lng}
      zoomLevel={zoomLevel}
    />
  );
}
