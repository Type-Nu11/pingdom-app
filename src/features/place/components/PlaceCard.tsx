import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

type PlaceCardProps = {
  address?: string;
  dimmed?: boolean;
  distanceMeters?: number;
  imageUrl?: string;
  name?: string;
};

function formatDistance(distanceMeters?: number) {
  if (distanceMeters === undefined) {
    return '';
  }

  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(1)}km`;
  }

  return `${Math.round(distanceMeters)}m`;
}

const PlaceCard = ({
  address,
  dimmed = false,
  distanceMeters,
  imageUrl,
  name,
}: PlaceCardProps) => {
  return (
    <View style={[styles.card, dimmed && styles.dimmedCard]}>
      {imageUrl ? (
        <Image
          resizeMode="cover"
          source={{ uri: imageUrl }}
          style={styles.previewImage}
        />
      ) : (
        <>
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
        </>
      )}
      <View style={styles.imageShade} />
      {name ? (
        <View style={styles.textOverlay}>
          <Text numberOfLines={1} style={styles.name}>{name}</Text>
          <Text numberOfLines={1} style={styles.meta}>
            {formatDistance(distanceMeters) || address}
          </Text>
        </View>
      ) : null}
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
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    height: undefined,
    width: undefined,
  },
  imageShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  name: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
  },
  meta: {
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
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
  textOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    bottom: 0,
    left: 0,
    paddingHorizontal: 7,
    paddingVertical: 5,
    position: 'absolute',
    right: 0,
  },
});

export default PlaceCard;
