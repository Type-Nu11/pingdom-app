import React from 'react';
import { StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import KakaoMapCard, { type KakaoMapMarkerPressEvent } from './KakaoMapCard';
import type { MapMarker } from '../model/place.types';

type MapCanvasProps = {
  centerLat: number;
  centerLng: number;
  followUser: boolean;
  markers: MapMarker[];
  onCameraIdle?: () => void;
  onMarkerPress: (event: KakaoMapMarkerPressEvent) => void;
  style?: StyleProp<ViewStyle>;
  userLat: number;
  userLng: number;
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
}: MapCanvasProps) => (
  <KakaoMapCard
    centerLat={centerLat}
    centerLng={centerLng}
    followUser={followUser}
    markers={markers}
    onCameraIdle={() => onCameraIdle?.()}
    onMarkerPress={onMarkerPress}
    style={[styles.map, style]}
    userLat={userLat}
    userLng={userLng}
    zoomLevel={4}
  />
);

const styles = StyleSheet.create({
  map: StyleSheet.absoluteFillObject,
});

export default MapCanvas;
