import React from 'react';
import { StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import KakaoMapAdapter from '../../../v2/features/map/components/KakaoMapAdapter';
import type { MapMarker } from '../model/place.types';

type MapCanvasProps = {
  centerLat: number;
  centerLng: number;
  followUser: boolean;
  markers: MapMarker[];
  onCameraIdle?: () => void;
  onMarkerPress: (markerId: string) => void;
  style?: StyleProp<ViewStyle>;
  userLat: number;
  userLng: number;
  zoomLevel: number;
};

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
  <KakaoMapAdapter
    center={{ lat: centerLat, lng: centerLng }}
    followUser={followUser}
    markers={markers.map((marker) => ({ ...marker, name: marker.id }))}
    onCameraIdle={() => onCameraIdle?.()}
    onMarkerSelect={onMarkerPress}
    style={[styles.map, style]}
    userCoordinate={{ lat: userLat, lng: userLng }}
    zoomLevel={zoomLevel}
  />
);

const styles = StyleSheet.create({
  map: StyleSheet.absoluteFillObject,
});

export default MapCanvas;
