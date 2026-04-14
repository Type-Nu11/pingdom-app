// screens/MapScreen.tsx
import React,{useState} from 'react';

import { Alert,StyleSheet, View } from 'react-native';
import KakaoMapView from '../components/KakaoMapView';

// MapScreen.tsx
type Props = {
  language: 'en' | 'ko';
};

export default function MapScreen({ language }: Props) {
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
