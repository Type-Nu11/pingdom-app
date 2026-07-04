import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../../styles/colors';

export default function BackgroundBlobs() {
  return (
    <>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />
    </>
  );
}

const styles = StyleSheet.create({
  blobTop: {
    position: 'absolute',
    width: 489,
    height: 227,
    borderRadius: 244,
    left: -142,
    top: 133,
    backgroundColor: 'rgba(255, 25, 86, 0.18)',
    shadowColor: colors.primaryNormal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 80,
    elevation: 0,
  },
  blobBottom: {
    position: 'absolute',
    width: 528,
    height: 212,
    borderRadius: 264,
    left: -3,
    top: 483,
    backgroundColor: 'rgba(255, 25, 86, 0.18)',
    shadowColor: colors.primaryNormal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 80,
    elevation: 0,
  },
});
