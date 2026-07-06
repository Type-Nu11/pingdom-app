import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

type PlaceCardProps = {
  address?: string;
  dimmed?: boolean;
  distanceMeters?: number;
  imageUrl?: string;
  isImageLoading?: boolean;
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
  isImageLoading = false,
  name,
}: PlaceCardProps) => {
  const [hasImageError, setHasImageError] = useState(false);
  const shouldShowImage = Boolean(imageUrl && !hasImageError);

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  return (
    <View style={[styles.card, dimmed && styles.dimmedCard]}>
      {shouldShowImage ? (
        <Image
          resizeMode="cover"
          source={{ uri: imageUrl }}
          style={styles.previewImage}
          onError={() => setHasImageError(true)}
        />
      ) : isImageLoading ? (
        <View style={styles.emptyPreview}>
          <ActivityIndicator color="rgba(255, 255, 255, 0.72)" size="small" />
        </View>
      ) : (
        <View style={styles.emptyPreview}>
          <Text numberOfLines={1} style={styles.emptyPreviewText}>
            {name?.slice(0, 1) ?? ''}
          </Text>
        </View>
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
  emptyPreview: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: '#252a32',
    justifyContent: 'center',
  },
  emptyPreviewText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 26,
    fontWeight: '900',
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
