import React from 'react';
import {
  type NativeSyntheticEvent,
  requireNativeComponent,
  type ViewProps,
} from 'react-native';
import styled from 'styled-components/native';

import type { Coordinate, MapMarker } from '../model/map.types';

type NativeCameraIdleEvent = NativeSyntheticEvent<Coordinate>;
type NativeMarkerPressEvent = NativeSyntheticEvent<{ markerId: string }>;

type NativeKakaoMapProps = ViewProps & {
  centerLat: number;
  centerLng: number;
  followUser?: boolean;
  markers?: Omit<MapMarker, 'name'>[];
  onCameraIdle?: (event: NativeCameraIdleEvent) => void;
  onMarkerPress?: (event: NativeMarkerPressEvent) => void;
  userLat?: number;
  userLng?: number;
  zoomLevel?: number;
};

export type KakaoMapAdapterProps = {
  center: Coordinate;
  followUser?: boolean;
  markers: MapMarker[];
  onCameraIdle?: (coordinate: Coordinate) => void;
  onMarkerSelect?: (markerId: string) => void;
  userCoordinate?: Coordinate;
  zoomLevel?: number;
};

const NativeKakaoMap = requireNativeComponent<NativeKakaoMapProps>('KakaoMapView');
const MapView = styled(NativeKakaoMap)`
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
