import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import NaverMapAdapter from './NaverMapAdapter';
import type { MapMarker } from '../../markers/model/placeMarker';

type MapCanvasProps = {
  centerLat: number;
  centerLng: number;
  followUser: boolean;
  markers: MapMarker[];
  onCameraIdle?: () => void;
  onMarkerPress: (markerId: string) => void;
  style?: StyleProp<ViewStyle>;
  userLat?: number;
  userLng?: number;
  zoomLevel: number;
};

// 연결 흐름: MapScreen → MapCanvas → NaverMapAdapter → 각 플랫폼의 NaverMapView.
// 화면이 계산한 좌표·마커를 전달하고, SDK별 속성/이벤트 변환은 어댑터가 담당한다.
const MapCanvas = ({
  centerLat,
  centerLng,
  followUser,
  markers,
  onCameraIdle,
  onMarkerPress,
  style,
  userLat,
  userLng,
  zoomLevel,
}: MapCanvasProps) => (
  <NaverMapAdapter
    center={{ lat: centerLat, lng: centerLng }}
    followUser={followUser}
    markers={markers}
    onCameraIdle={() => onCameraIdle?.()}
    onMarkerSelect={onMarkerPress}
    style={[styles.map, style]}
    userCoordinate={userLat !== undefined && userLng !== undefined ? { lat: userLat, lng: userLng } : undefined}
    zoomLevel={zoomLevel}
  />
);

const styles = {
  map: { bottom: 0, left: 0, position: 'absolute' as const, right: 0, top: 0 },
};

export default MapCanvas;
