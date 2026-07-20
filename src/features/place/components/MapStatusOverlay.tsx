import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import GlassSurface from './GlassSurface';

type MapStatusOverlayProps = {
  placeCount: number;
  region: string;
};

const MapStatusOverlay = ({ placeCount, region }: MapStatusOverlayProps) => {
  const { t } = useTranslation();

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <GlassSurface style={styles.summaryCard} tintColor="rgba(255,255,255,0.22)">
        <Text style={styles.region}>{region}</Text>
        <View style={styles.statusRow}>
          <View style={styles.liveDot} />
          <Text style={styles.statusText}>{t('map.decision.placesLiveNearby', { count: placeCount })}</Text>
        </View>
      </GlassSurface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { left: 18, position: 'absolute', top: 58, zIndex: 20 },
  liveDot: { backgroundColor: '#20C877', borderRadius: 4, height: 8, width: 8 },
  region: { color: '#161C23', fontSize: 16, fontWeight: '900' },
  statusRow: { alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: 3 },
  statusText: { color: '#606771', fontSize: 11, fontWeight: '700' },
  summaryCard: { borderColor: 'rgba(255,255,255,0.72)', borderRadius: 17, borderWidth: 1, elevation: 5, overflow: 'hidden', paddingHorizontal: 14, paddingVertical: 10, shadowColor: '#17202A', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.13, shadowRadius: 8 },
});

export default MapStatusOverlay;
