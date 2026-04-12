import React from 'react';
import { View, StyleSheet, requireNativeComponent, Platform, Text, ViewProps } from 'react-native';

const KakaoMapView = requireNativeComponent<ViewProps>('KakaoMapView');
const MapScreen = () => {
  if (Platform.OS !== 'android') {
    return (
      <View style={styles.fallbackContainer}>
        <Text>KakaoMapView is currently Android-only.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KakaoMapView style={styles.map} />
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
