import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type PlaceCardProps = {
  dimmed?: boolean;
};

const PlaceCard = ({ dimmed = false }: PlaceCardProps) => {
  return (
    <View style={[styles.card, dimmed && styles.dimmedCard]}>
      <View style={styles.skyline}>
        <View style={[styles.tower, styles.towerShort]} />
        <View style={[styles.tower, styles.towerTall]} />
        <View style={[styles.tower, styles.towerMid]} />
        <View style={[styles.tower, styles.towerTiny]} />
      </View>
      <View style={styles.crowd}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
      {dimmed ? <Text style={styles.moreText}>•••</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1d222a',
    borderRadius: 9,
    height: 72,
    marginRight: 12,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingTop: 9,
    width: 78,
  },
  dimmedCard: {
    opacity: 0.72,
  },
  skyline: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    height: 38,
    justifyContent: 'space-around',
  },
  tower: {
    backgroundColor: '#f6d79c',
    borderRadius: 2,
    width: 10,
  },
  towerShort: {
    height: 21,
  },
  towerTall: {
    height: 36,
  },
  towerMid: {
    height: 28,
  },
  towerTiny: {
    height: 17,
  },
  crowd: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 9,
  },
  dot: {
    backgroundColor: '#f8f0e5',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  moreText: {
    bottom: 19,
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
    position: 'absolute',
    right: 12,
  },
});

export default PlaceCard;
