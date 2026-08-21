import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LikeIcon from '../../../assets/v2/icons/actions/Like.svg';
import SavedIcon from '../../../assets/v2/icons/actions/Saved.svg';
import { usePlacePreviewImages } from '../hooks/usePlacePreviewImages';
import { usePlaceRegistrantUsernames } from '../hooks/usePlaceRegistrantUsernames';
import type { RecommendedPlace } from '../model/place.types';

type RecommendedPlaceGridProps = {
  isError?: boolean;
  isLoading?: boolean;
  onPlacePress?: (place: RecommendedPlace) => void;
  places: RecommendedPlace[];
};

const formatUsername = (username: string | undefined) => (
  username?.trim() ? username : '등록자 없음'
);

type RecommendedPlaceCardProps = {
  address?: string;
  imageUrl?: string;
  isImageLoading?: boolean;
  name: string;
  onPress?: () => void;
  rank: number;
  username?: string;
};

const RecommendedPlaceCard = ({
  address,
  imageUrl,
  isImageLoading = false,
  name,
  onPress,
  rank,
  username,
}: RecommendedPlaceCardProps) => {
  const [hasImageError, setHasImageError] = useState(false);
  const shouldShowImage = Boolean(imageUrl && !hasImageError);

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name} 추천 장소 보기`}
      style={styles.card}
      onPress={onPress}
    >
      {shouldShowImage ? (
        <Image
          resizeMode="cover"
          source={{ uri: imageUrl }}
          style={styles.cardImage}
          onError={() => setHasImageError(true)}
        />
      ) : (
        <View style={styles.emptyImage}>
          {isImageLoading ? (
            <ActivityIndicator color="#ff4a75" size="small" />
          ) : (
            <Text numberOfLines={1} style={styles.emptyInitial}>
              {name.slice(0, 1)}
            </Text>
          )}
        </View>
      )}
      <View style={styles.topShade} />
      <View style={styles.bottomShade} />

      <Text numberOfLines={1} style={styles.cardTitle}>
        {rank}. {name}
      </Text>
      <View style={styles.cardFooter}>
        <View style={styles.cardMeta}>
          <Text numberOfLines={1} style={styles.username}>
            {formatUsername(username)}
          </Text>
          <Text numberOfLines={1} style={styles.address}>
            {address || '주소 정보 없음'}
          </Text>
        </View>
        <View style={styles.cardActions}>
          <LikeIcon color="#fff" height={21} width={23} />
          <SavedIcon color="#fff" height={22} width={19} />
        </View>
      </View>
    </Pressable>
  );
};

const RecommendedPlaceGrid = ({
  isError = false,
  isLoading = false,
  onPlacePress,
  places,
}: RecommendedPlaceGridProps) => {
  const visiblePlaces = places.slice(0, 4);
  const {
    imageUrlsByPlaceId,
    isLoadingByPlaceId,
  } = usePlacePreviewImages(visiblePlaces);
  const { isLoadingByPlaceId: isUsernameLoadingByPlaceId, usernamesByPlaceId } =
    usePlaceRegistrantUsernames(visiblePlaces);
  const fallbackImageUrl = useMemo(
    () => visiblePlaces
      .map((place) => imageUrlsByPlaceId[String(place.id)])
      .find(Boolean),
    [imageUrlsByPlaceId, visiblePlaces]
  );
  const stateText = isLoading
    ? '추천 장소를 불러오고 있어요'
    : isError
      ? '추천 장소를 불러오지 못했어요'
      : visiblePlaces.length === 0
        ? '추천 장소가 아직 없어요'
        : null;
  const imageCount = Object.keys(imageUrlsByPlaceId).length;

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    console.log('[RecommendedPlaceGrid]', {
      fallbackImageUrl,
      imageCount,
      isError,
      isLoading,
      placeIds: visiblePlaces.map((place) => place.id),
      placesCount: places.length,
      visiblePlacesCount: visiblePlaces.length,
    });
  }, [
    fallbackImageUrl,
    imageCount,
    isError,
    isLoading,
    places.length,
    visiblePlaces,
  ]);

  if (stateText) {
    return (
      <View style={styles.stateBox}>
        <Text style={styles.stateText}>{stateText}</Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {visiblePlaces.map((place, index) => {
        const placeKey = String(place.id);
        const username = usernamesByPlaceId[placeKey] ?? place.username;

        return (
          <RecommendedPlaceCard
            address={place.address}
            imageUrl={imageUrlsByPlaceId[placeKey] ?? fallbackImageUrl}
            isImageLoading={isLoadingByPlaceId[placeKey]}
            key={`${place.id}-${index}`}
            name={place.name}
            rank={index + 1}
            username={username ?? (isUsernameLoadingByPlaceId[placeKey] ? '등록자 확인 중' : undefined)}
            onPress={() => onPlacePress?.(place)}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  card: {
    backgroundColor: '#e9edf2',
    borderRadius: 8,
    height: 94,
    overflow: 'hidden',
    width: '100%',
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    height: undefined,
    width: undefined,
  },
  emptyImage: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: '#e7ebf0',
    justifyContent: 'center',
  },
  emptyInitial: {
    color: '#9a9da7',
    fontSize: 42,
    fontWeight: '900',
  },
  topShade: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    height: 38,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  bottomShade: {
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
    bottom: 0,
    height: 46,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  cardTitle: {
    color: '#2f333b',
    fontSize: 17,
    fontWeight: '900',
    left: 8,
    position: 'absolute',
    right: 8,
    top: 8,
  },
  cardFooter: {
    alignItems: 'flex-end',
    bottom: 8,
    flexDirection: 'row',
    gap: 8,
    left: 8,
    position: 'absolute',
    right: 8,
  },
  cardMeta: {
    flex: 1,
  },
  username: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
  address: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  cardActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    paddingBottom: 2,
  },
  stateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    paddingHorizontal: 24,
  },
  stateText: {
    color: '#747681',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default RecommendedPlaceGrid;
