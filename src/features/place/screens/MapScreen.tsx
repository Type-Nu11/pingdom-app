// screens/MapScreen.tsx
import React,{useEffect} from 'react';
import { Language } from '../../../shared/i18n';
import { StyleSheet, View } from 'react-native';
import KakaoMapView from '../components/KakaoMapView';
import * as Location from 'expo-location';

// MapScreen.tsx
type Props = {
  language: Language;
};
export default function MapScreen() {
    useEffect(() => {
    const requestPermission = async () => {
      const {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('위치 권한 거부')
        return;
      }
      console.log('위치 권한 허용도')
    }
    requestPermission();
  })
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
