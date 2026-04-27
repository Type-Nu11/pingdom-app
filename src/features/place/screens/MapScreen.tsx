// screens/MapScreen.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import KakaoMapCard from '../components/KakaoMapCard';
import { useCurrentLocation } from '../hooks/useCurrentLocation';

export default function MapScreen() {
  const center = useCurrentLocation();
  return (
    <View style={styles.container}>
      <KakaoMapCard style={styles.map} centerLat={center.lat} centerLng={center.lng} zoomLevel={7} />
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
