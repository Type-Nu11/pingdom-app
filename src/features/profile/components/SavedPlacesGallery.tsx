import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Place } from '../../place/model/place.types';

type SavedPlacesGalleryProps = {
  isError?: boolean;
  isLoading?: boolean;
  itemSize: number;
  onPlacePress: (place: Place) => void;
  onRetry: () => void;
  places: Place[];
};

const SavedPlacesGallery = ({
  isError = false,
  isLoading = false,
  itemSize,
  onPlacePress,
  onRetry,
  places,
}: SavedPlacesGalleryProps) => (
  <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
    {isLoading ? (
      <View style={styles.stateContainer}>
        <ActivityIndicator color="#ff1956" />
        <Text style={styles.stateText}>저장한 장소를 불러오고 있어요</Text>
      </View>
    ) : isError ? (
      <View style={styles.stateContainer}>
        <Text style={styles.stateText}>저장한 장소를 불러오지 못했어요</Text>
        <Pressable
          accessibilityLabel="저장한 장소 다시 불러오기"
          accessibilityRole="button"
          style={styles.retryButton}
          onPress={onRetry}
        >
          <Text style={styles.retryText}>다시 시도</Text>
        </Pressable>
      </View>
    ) : places.length === 0 ? (
      <View style={styles.stateContainer}>
        <Text style={styles.stateText}>저장한 장소가 없어요</Text>
      </View>
    ) : (
      <View style={styles.gallery}>
        {places.map((place) => (
          <Pressable
            accessibilityLabel={`${place.name} 장소 보기`}
            accessibilityRole="button"
            key={place.id}
            style={[styles.tile, { height: itemSize, width: itemSize }]}
            onPress={() => onPlacePress(place)}
          >
            <View style={styles.fallback}>
              <Text numberOfLines={2} style={styles.placeName}>{place.name}</Text>
              <Text numberOfLines={1} style={styles.placeAddress}>{place.address}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    )}
  </ScrollView>
);

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: '#f1f2f4',
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
  },
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  placeAddress: {
    color: '#747681',
    fontSize: 11,
    marginTop: 4,
  },
  placeName: {
    color: '#202024',
    fontSize: 14,
    fontWeight: '800',
  },
  retryButton: {
    backgroundColor: '#ff1956',
    borderRadius: 10,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 240,
    paddingHorizontal: 24,
  },
  stateText: {
    color: '#747681',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center',
  },
  tile: {
    borderColor: '#fafafa',
    borderWidth: 1,
    overflow: 'hidden',
  },
});

export default SavedPlacesGallery;
