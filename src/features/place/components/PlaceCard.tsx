import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

type PlaceCardProps = {
  dimmed?: boolean;
  imageUrl?: string;
  isImageLoading?: boolean;
  name?: string;
  rank?: number;
};

const PlaceCard = ({
  dimmed = false,
  imageUrl,
  isImageLoading = false,
  name,
  rank,
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
      {rank ? (
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{rank}</Text>
        </View>
      ) : null}
      {dimmed ? <Text style={styles.moreText}>•••</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1d222a',
    borderRadius: 8,
    height: 58,
    marginRight: 14,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingTop: 9,
    width: 58,
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    height: undefined,
    width: undefined,
  },
  imageShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
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
    fontSize: 22,
    fontWeight: '900',
  },
  moreText: {
    bottom: 18,
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    position: 'absolute',
    right: 12,
  },
  rankBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(17, 20, 26, 0.82)',
    borderRadius: 8,
    bottom: 6,
    height: 19,
    justifyContent: 'center',
    position: 'absolute',
    right: 5,
    transform: [{ rotate: '-12deg' }],
    width: 24,
  },
  rankText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 15,
  },
});

export default PlaceCard;
