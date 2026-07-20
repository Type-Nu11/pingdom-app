import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import GlassSurface from './GlassSurface';

type MapStatusOverlayProps = {
  onProfilePress?: () => void;
  placeCount: number;
  region: string;
};

const MapStatusOverlay = ({ onProfilePress, placeCount, region }: MapStatusOverlayProps) => (
  <View pointerEvents="box-none" style={styles.container}>
    <GlassSurface style={styles.summaryCard} tintColor="rgba(255,255,255,0.22)">
      <Text style={styles.region}>{region}</Text>
      <View style={styles.statusRow}>
        <View style={styles.liveDot} />
        <Text style={styles.statusText}>{placeCount} places live nearby</Text>
      </View>
    </GlassSurface>
    <Pressable accessibilityLabel="프로필 열기" onPress={onProfilePress}>
      <GlassSurface interactive style={styles.profileButton} tintColor="rgba(19,29,40,0.42)">
        <Text style={styles.profileText}>P</Text>
      </GlassSurface>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  container: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', left: 18, position: 'absolute', right: 18, top: 58, zIndex: 20 },
  liveDot: { backgroundColor: '#20C877', borderRadius: 4, height: 8, width: 8 },
  profileButton: { alignItems: 'center', backgroundColor: '#151E28', borderColor: 'rgba(255,255,255,0.72)', borderRadius: 22, borderWidth: 2, height: 44, justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.16, shadowRadius: 7, width: 44 },
  profileText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  region: { color: '#161C23', fontSize: 16, fontWeight: '900' },
  statusRow: { alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: 3 },
  statusText: { color: '#606771', fontSize: 11, fontWeight: '700' },
  summaryCard: { borderColor: 'rgba(255,255,255,0.72)', borderRadius: 17, borderWidth: 1, elevation: 5, overflow: 'hidden', paddingHorizontal: 14, paddingVertical: 10, shadowColor: '#17202A', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.13, shadowRadius: 8 },
});

export default MapStatusOverlay;
