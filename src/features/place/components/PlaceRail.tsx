import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { usePlacePreviewImages } from '../hooks/usePlacePreviewImages';
import type { RecommendedPlace } from '../model/place.types';
import PlaceCard from './PlaceCard';

type PlaceRailProps = {
  isLoading?: boolean;
  onPlacePress?: (place: RecommendedPlace) => void;
  places: RecommendedPlace[];
};

const PlaceRail = ({
  isLoading = false,
  onPlacePress,
  places,
}: PlaceRailProps) => {
  const visiblePlaces = places.slice(0, 5);
  const {
    imageUrlsByPlaceId,
    isLoadingByPlaceId,
  } = usePlacePreviewImages(visiblePlaces);
  const fallbackImageUrl = visiblePlaces
    .map((place) => imageUrlsByPlaceId[String(place.id)])
    .find(Boolean);

  return (
    <View style={styles.placeRail}>
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.placeScroller}
        contentContainerStyle={styles.placeList}
      >
        {isLoading ? (
          <Text style={styles.stateText}>추천 장소를 불러오고 있어요</Text>
        ) : visiblePlaces.length === 0 ? (
          <Text style={styles.stateText}>추천 장소가 아직 없어요</Text>
        ) : (
          visiblePlaces.map((place, index) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${place.name} 추천 장소 보기`}
              key={place.id}
              onPress={() => onPlacePress?.(place)}
            >
              <PlaceCard
                address={place.address}
                dimmed={index === 4 && places.length > 5}
                distanceMeters={place.distanceMeters}
                imageUrl={imageUrlsByPlaceId[String(place.id)] ?? fallbackImageUrl}
                isImageLoading={isLoadingByPlaceId[String(place.id)]}
                name={place.name}
              />
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  placeRail: {
    borderColor: '#e5e6eb',
    borderRadius: 12,
    borderWidth: 1,
    height: 78,
    justifyContent: 'center',
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  placeScroller: {
    flexGrow: 0,
  },
  placeList: {
    alignItems: 'center',
    minHeight: 58,
    paddingHorizontal: 12,
  },
  stateText: {
    color: '#747681',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default PlaceRail;
