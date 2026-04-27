// screens/MapScreen.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import KakaoMapCard from '../components/KakaoMapCard';
import { useCurrentLocation } from '../hooks/useCurrentLocation';

export default function MapScreen() {
  const { center, userLat, userLng, followUser } = useCurrentLocation();
  return (
    <View style={styles.container}>
      <KakaoMapCard
        style={styles.map}
        centerLat={center.lat}
        centerLng={center.lng}
        zoomLevel={16}
        userLat={userLat}
        userLng={userLng}
        followUser={followUser}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
