import React from 'react';
import { StyleSheet, View } from 'react-native';
import KakaoMap from '../components/KakaoMapView';

const MapScreen = () => {
  const centerLat = 37.402001;
  const centerLng = 127.108678;

  return (
    <View style={styles.container}>
      <KakaoMap style={styles.map} centerLat={centerLat} centerLng={centerLng} zoomLevel={7} />
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
