// screens/MapScreen.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import KakaoMapCard from '../components/KakaoMapCard';
import { useCurrentLocation } from '../hooks/useCurrentLocation';

export default function MapScreen() {
  const center = useCurrentLocation();
  return (
    <View style={styles.container}>
      <KakaoMapCard style={styles.map} centerLat={center.lat} centerLng={center.lng} zoomLevel={16} />
      <View pointerEvents='none' style={styles.currentDotOuter}>
        <View style={styles.currentDotInner}></View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  currentDotOuter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -10,
    marginTop: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(30,136,229,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E88E5',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
});
