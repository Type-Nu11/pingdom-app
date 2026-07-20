import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

type MapControlRailProps = {
  bottom: number;
  mapType: 'Map' | 'Transit';
  onLocatePress: () => void;
  onMapTypePress: () => void;
  sheetTranslateY: Animated.Value;
};

const MapControlRail = ({
  bottom,
  mapType,
  onLocatePress,
  onMapTypePress,
  sheetTranslateY,
}: MapControlRailProps) => (
  <Animated.View style={[styles.rail, { bottom, transform: [{ translateY: sheetTranslateY }] }]}>
    <Pressable accessibilityLabel="지도 타입 변경" onPress={onMapTypePress} style={styles.button}>
      <Text style={styles.mapIcon}>◇</Text>
      <Text style={styles.buttonLabel}>{mapType}</Text>
    </Pressable>
    <View style={styles.divider} />
    <Pressable accessibilityLabel="현재 위치로 이동" onPress={onLocatePress} style={styles.button}>
      <Text style={styles.locationIcon}>➤</Text>
      <Text style={styles.buttonLabel}>Near me</Text>
    </Pressable>
  </Animated.View>
);

const styles = StyleSheet.create({
  button: { alignItems: 'center', height: 57, justifyContent: 'center', width: 58 },
  buttonLabel: { color: '#565D67', fontSize: 8, fontWeight: '800', marginTop: 1 },
  divider: { alignSelf: 'center', backgroundColor: '#E5E7EA', height: 1, width: 34 },
  locationIcon: { color: '#EC245B', fontSize: 20, transform: [{ rotate: '-42deg' }] },
  mapIcon: { color: '#222A33', fontSize: 24, fontWeight: '900', lineHeight: 25 },
  rail: { backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 19, elevation: 8, overflow: 'hidden', position: 'absolute', right: 16, shadowColor: '#131A22', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 10, zIndex: 25 },
});

export default MapControlRail;
