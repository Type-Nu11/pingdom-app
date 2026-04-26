// screens/MapScreen.tsx
import React from 'react';
import { Language } from '../../../shared/i18n';
import { StyleSheet, View } from 'react-native';
import KakaoMapView from '../components/KakaoMapView';

// MapScreen.tsx
type Props = {
  language: Language;
};


export default function MapScreen() {
  return (
    <View style={styles.container}>
      <KakaoMapView style={styles.map} centerLat={37.402001} centerLng={127.108678} zoomLevel={7} />
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
