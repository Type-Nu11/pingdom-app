import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { usePlacePreviewImages } from '../hooks/usePlacePreviewImages';
import type { RecommendedPlace } from '../model/place.types';

type HotPlaceListProps = {
  isError?: boolean;
  isLoading?: boolean;
  onPlacePress?: (place: RecommendedPlace) => void;
  places: RecommendedPlace[];
};

function formatDistance(distanceMeters: number) {
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(1)}km`;
  }

  return `${Math.round(distanceMeters)}m`;
}

const HotPlaceList = ({
  isError = false,
  isLoading = false,
  onPlacePress,
  places,
}: HotPlaceListProps) => {
  const previewImages = usePlacePreviewImages(places);
  const stateText = isLoading
    ? '추천 장소를 불러오고 있어요'
    : isError
      ? '추천 장소를 불러오지 못했어요'
      : places.length === 0
        ? '주변 추천 장소가 아직 없어요'
        : null;

  return (
    <View style={styles.hotSection}>
      <View style={styles.hotTitleRow}>
        <View style={styles.hotIcon} />
        <Text style={styles.hotTitle}>Hot Place</Text>
      </View>

      {stateText ? (
        <View style={styles.stateRow}>
          <Text style={styles.stateText}>{stateText}</Text>
        </View>
      ) : places.map((place, index) => {
        const rank = index + 1;
        const previewImageUrl = previewImages[String(place.id)];

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${place.name} 추천 장소 보기`}
            key={place.id}
            style={styles.hotRow}
            onPress={() => onPlacePress?.(place)}
          >
            <View style={[styles.rankBadge, rank !== 1 && styles.rankBadgeMuted]}>
              <Text style={[styles.rankText, rank !== 1 && styles.rankTextMuted]}>
                {rank}
              </Text>
            </View>
            <View style={styles.thumbnail}>
              {previewImageUrl ? (
                <Image
                  resizeMode="cover"
                  source={{ uri: previewImageUrl }}
                  style={styles.thumbnailImage}
                />
              ) : (
                <View style={styles.thumbnailFallback}>
                  <Text numberOfLines={1} style={styles.thumbnailFallbackText}>
                    {place.name.slice(0, 1)}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.hotTextGroup}>
              <Text numberOfLines={1} style={styles.hotLocation}>{place.name}</Text>
              <Text numberOfLines={1} style={styles.hotUsername}>
                {formatDistance(place.distanceMeters)} · {place.reason}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  hotSection: {
    paddingTop: 22,
  },
  hotTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 13,
    paddingHorizontal: 42,
  },
  hotIcon: {
    backgroundColor: '#ff1956',
    borderRadius: 12,
    height: 24,
    width: 24,
  },
  hotTitle: {
    color: '#3a3b43',
    fontSize: 25,
    fontWeight: '900',
  },
  hotRow: {
    alignItems: 'center',
    borderTopColor: '#ececf0',
    borderTopWidth: 1,
    flexDirection: 'row',
    height: 73,
    paddingHorizontal: 43,
  },
  hotTextGroup: {
    flex: 1,
  },
  rankBadge: {
    alignItems: 'center',
    borderColor: '#ff9f1a',
    borderRadius: 13,
    borderWidth: 3,
    height: 27,
    justifyContent: 'center',
    marginRight: 17,
    width: 27,
  },
  rankBadgeMuted: {
    borderColor: '#7d7f8a',
  },
  rankText: {
    color: '#df8600',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
  rankTextMuted: {
    color: '#747681',
  },
  thumbnail: {
    alignItems: 'center',
    backgroundColor: '#eff0f4',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    marginRight: 11,
    overflow: 'hidden',
    width: 42,
  },
  thumbnailFallback: {
    alignItems: 'center',
    backgroundColor: '#e4e5ea',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  thumbnailFallbackText: {
    color: '#747681',
    fontSize: 16,
    fontWeight: '900',
  },
  thumbnailImage: {
    height: '100%',
    width: '100%',
  },
  hotLocation: {
    color: '#6e7079',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 3,
  },
  hotUsername: {
    color: '#111217',
    fontSize: 12,
    fontWeight: '800',
  },
  stateRow: {
    borderTopColor: '#ececf0',
    borderTopWidth: 1,
    minHeight: 73,
    justifyContent: 'center',
    paddingHorizontal: 43,
  },
  stateText: {
    color: '#747681',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default HotPlaceList;
