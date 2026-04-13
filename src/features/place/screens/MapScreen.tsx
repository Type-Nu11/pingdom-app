import React from 'react';
import { StyleSheet, View } from 'react-native';
import KakaoMap from '../components/KakaoMapView';

const MapScreen = () => {
  return (
    <View style={styles.container}>
      <KakaoMap style={styles.map} />
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
