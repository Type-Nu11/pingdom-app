import { useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import MypingIcon from '../../../../assets/icons/map/Myping.svg';
import type { KakaoLocalSearchItem } from '../../api/kakaoLocalApi';
import { useKakaoLocalSearch } from '../../hooks/useKakaoLocalSearch';
import type { PlaceCreateDraft } from '../../model/place.types';
import KakaoMapCard, { KakaoMapCameraIdleEvent } from '../KakaoMapCard';
import { DEFAULT_PLACE_COORDINATE } from './constants';

type LocationStepProps = {
  initialValue: PlaceCreateDraft | null;
  isSubmitting?: boolean;
  mapHeight: number;
  onNext: (draft: PlaceCreateDraft) => void | Promise<void>;
};

type Coordinate = {
  lat: number;
  lng: number;
};

const COORDINATE_MATCH_THRESHOLD = 0.0001;

function isSameCoordinate(a: Coordinate, b: Coordinate) {
  return (
    Math.abs(a.lat - b.lat) <= COORDINATE_MATCH_THRESHOLD
    && Math.abs(a.lng - b.lng) <= COORDINATE_MATCH_THRESHOLD
  );
}

const LocationStep = ({
  initialValue,
  isSubmitting = false,
  mapHeight,
  onNext,
}: LocationStepProps) => {
  const { t } = useTranslation();
  const placeSelectPlaceholder = t('placeCreate.location.placeholderAddress');
  const searchEmptyMessage = t('placeCreate.location.searchEmpty');
  const searchFailedMessage = t('placeCreate.location.searchFailed');
  const pendingSearchResultCoordinateRef = useRef<Coordinate | null>(null);
  const [addressQuery, setAddressQuery] = useState('');
  const [placeName, setPlaceName] = useState(initialValue?.name ?? '');
  const [selectedAddress, setSelectedAddress] = useState(
    initialValue?.address ?? placeSelectPlaceholder
  );
  const [selectedKakaoPlaceId, setSelectedKakaoPlaceId] = useState(initialValue?.kakaoPlaceId);
  const [selectedPlaceCoordinate, setSelectedPlaceCoordinate] = useState<Coordinate | null>(
    initialValue ? { lat: initialValue.latitude, lng: initialValue.longitude } : null
  );
  const [mapCenter, setMapCenter] = useState({
    lat: initialValue?.latitude ?? DEFAULT_PLACE_COORDINATE.lat,
    lng: initialValue?.longitude ?? DEFAULT_PLACE_COORDINATE.lng,
  });
  const [selectedCoordinate, setSelectedCoordinate] = useState({
    lat: initialValue?.latitude ?? DEFAULT_PLACE_COORDINATE.lat,
    lng: initialValue?.longitude ?? DEFAULT_PLACE_COORDINATE.lng,
  });
  const {
    clearSearchResults,
    isSearchingAddress,
    resolveAddressFromCoordinate,
    searchPlaces,
    searchResults,
    searchStatusMessage,
  } = useKakaoLocalSearch();
  const isSelectedAddressInvalid = selectedAddress === searchEmptyMessage
    || selectedAddress === searchFailedMessage
    || selectedAddress === placeSelectPlaceholder;
  const isSelectionDisabled = isSelectedAddressInvalid || isSubmitting;
  const selectableSearchResults = searchResults.filter((result) => result.kakaoPlaceId);

  const applySearchResult = (result: KakaoLocalSearchItem) => {
    if (!result.kakaoPlaceId) {
      return;
    }

    const nextAddress = result.roadAddress || result.address;
    const nextCoordinate = { lat: result.lat, lng: result.lng };

    Keyboard.dismiss();
    pendingSearchResultCoordinateRef.current = nextCoordinate;
    setAddressQuery(result.name);
    setMapCenter(nextCoordinate);
    setSelectedCoordinate(nextCoordinate);
    setSelectedPlaceCoordinate(nextCoordinate);
    setSelectedAddress(nextAddress);
    setSelectedKakaoPlaceId(result.kakaoPlaceId);
    setPlaceName(result.name);
    clearSearchResults();
  };

  const handleCameraIdle = async (event: KakaoMapCameraIdleEvent) => {
    const { lat, lng } = event.nativeEvent;
    const nextCoordinate = { lat, lng };
    let shouldUseAddressAsPlaceName = !selectedKakaoPlaceId;

    setSelectedCoordinate(nextCoordinate);

    const pendingSearchResultCoordinate = pendingSearchResultCoordinateRef.current;

    if (pendingSearchResultCoordinate) {
      if (!isSameCoordinate(nextCoordinate, pendingSearchResultCoordinate)) {
        return;
      }

      pendingSearchResultCoordinateRef.current = null;
      setSelectedPlaceCoordinate(pendingSearchResultCoordinate);
      shouldUseAddressAsPlaceName = false;
    } else if (selectedPlaceCoordinate && !isSameCoordinate(nextCoordinate, selectedPlaceCoordinate)) {
      setAddressQuery('');
      setSelectedKakaoPlaceId(undefined);
      setSelectedPlaceCoordinate(null);
      shouldUseAddressAsPlaceName = true;
    }

    const nextAddress = await resolveAddressFromCoordinate(lat, lng);

    if (nextAddress) {
      setSelectedAddress(nextAddress);
      if (shouldUseAddressAsPlaceName) {
        setPlaceName('');
      }
    }
  };

  const handleSearchAddress = async () => {
    await searchPlaces(addressQuery, {
      centerLat: selectedCoordinate.lat,
      centerLng: selectedCoordinate.lng,
    });
  };

  const handleSelectLocation = () => {
    const trimmedName = placeName.trim() || selectedAddress.trim();
    if (!trimmedName || isSelectionDisabled) {
      return;
    }
    void onNext({
      address: selectedAddress,
      kakaoPlaceId: selectedKakaoPlaceId,
      latitude: selectedCoordinate.lat,
      longitude: selectedCoordinate.lng,
      name: trimmedName,
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.stepContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={styles.stepBody}
    >
      <Text style={styles.title}>{t('placeCreate.location.title')}</Text>
      <View style={styles.searchBox}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('placeCreate.location.searchAccessibilityLabel')}
          disabled={isSearchingAddress}
          hitSlop={8}
          onPress={handleSearchAddress}
        >
          <Text style={styles.searchIcon}>⌕</Text>
        </Pressable>
        <TextInput
          style={styles.searchInput}
          placeholder={t('placeCreate.location.searchPlaceholder')}
          placeholderTextColor="#777a84"
          returnKeyType="search"
          value={addressQuery}
          onChangeText={setAddressQuery}
          onSubmitEditing={handleSearchAddress}
        />
      </View>
      {isSearchingAddress ? (
        <View style={styles.searchStatusRow}>
          <ActivityIndicator color="#ff1956" size="small" />
          <Text style={styles.searchStatusInlineText}>{t('placeCreate.location.searching')}</Text>
        </View>
      ) : searchStatusMessage ? (
        <Text style={styles.searchStatusText}>{searchStatusMessage}</Text>
      ) : null}
      {searchResults.length > 0 ? (
        <View style={styles.searchResultList}>
          {selectableSearchResults.length === 0 ? (
            <View style={styles.searchResultItem}>
              <Text style={styles.searchResultName}>{t('placeCreate.location.noSelectableResultsTitle')}</Text>
              <Text style={styles.searchResultAddress}>{t('placeCreate.location.noSelectableResultsBody')}</Text>
            </View>
          ) : selectableSearchResults.slice(0, 5).map((result) => {
            const resultAddress = result.roadAddress || result.address;

            return (
              <Pressable
                accessibilityRole="button"
                key={result.id}
                style={styles.searchResultItem}
                onPress={() => applySearchResult(result)}
              >
                <Text numberOfLines={1} style={styles.searchResultName}>{result.name}</Text>
                <Text numberOfLines={1} style={styles.searchResultAddress}>{resultAddress}</Text>
                {result.category ? (
                  <Text numberOfLines={1} style={styles.searchResultCategory}>{result.category}</Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
      <View style={[styles.mapPreview, { height: mapHeight }]}>
        <KakaoMapCard
          style={styles.map}
          centerLat={mapCenter.lat}
          centerLng={mapCenter.lng}
          zoomLevel={17}
          followUser={false}
          onCameraIdle={handleCameraIdle}
        />
        <View style={styles.mapFade} pointerEvents="none" />
        <MypingIcon
          height={71}
          pointerEvents="none"
          style={styles.selectedMarker}
          width={55}
        />
      </View>
      <View style={styles.locationPanel}>
        <View style={styles.selectedAddressRow} pointerEvents="none">
          <Text
            numberOfLines={1}
            style={[
              styles.selectedAddressText,
              isSelectedAddressInvalid && styles.selectedAddressPlaceholder,
            ]}
          >
            {selectedAddress}
          </Text>
        </View>
        <TextInput
          style={styles.placeNameInput}
          placeholder={t('placeCreate.location.detailAddressPlaceholder')}
          placeholderTextColor="#777a84"
          value={placeName}
          onChangeText={setPlaceName}
        />
        <Pressable
          accessibilityRole="button"
          disabled={isSelectionDisabled}
          style={[
            styles.primaryButton,
            isSelectionDisabled && styles.primaryButtonDisabled,
          ]}
          onPress={handleSelectLocation}
        >
          <Text style={styles.primaryButtonText}>
            {isSubmitting ? t('placeCreate.location.selectChecking') : t('placeCreate.location.select')}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  stepBody: {
    flex: 1,
  },
  stepContent: {
    flexGrow: 1,
    paddingBottom: 18,
  },
  title: {
    color: '#3e414b',
    fontSize: 26,
    fontWeight: '500',
    lineHeight: 34,
    paddingHorizontal: 34,
    paddingTop: 18,
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: '#e7e7ea',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 10,
    height: 62,
    marginHorizontal: 34,
    marginTop: 24,
    paddingHorizontal: 16,
  },
  searchIcon: {
    color: '#777a84',
    fontSize: 31,
    lineHeight: 34,
  },
  searchInput: {
    color: '#777a84',
    flex: 1,
    fontSize: 19,
    fontWeight: '500',
    padding: 0,
  },
  searchStatusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 34,
    marginTop: 10,
  },
  searchStatusText: {
    color: '#777a84',
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 34,
    marginTop: 10,
  },
  searchStatusInlineText: {
    color: '#777a84',
    fontSize: 14,
    fontWeight: '600',
  },
  searchResultList: {
    backgroundColor: '#fff',
    borderColor: '#ececf0',
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 34,
    marginTop: 10,
    overflow: 'hidden',
  },
  searchResultItem: {
    borderBottomColor: '#f0f0f3',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchResultName: {
    color: '#1d2028',
    fontSize: 16,
    fontWeight: '800',
  },
  searchResultAddress: {
    color: '#555965',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  searchResultCategory: {
    color: '#9b9da7',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  mapPreview: {
    marginTop: 16,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapFade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248, 250, 252, 0.18)',
  },
  selectedMarker: {
    left: '50%',
    position: 'absolute',
    top: '50%',
    transform: [{ translateX: -27.5 }, { translateY: -35.5 }],
  },
  locationPanel: {
    backgroundColor: '#fff',
    paddingHorizontal: 34,
    paddingBottom: 42,
    paddingTop: 22,
  },
  selectedAddressPlaceholder: {
    color: '#777a84',
  },
  selectedAddressRow: {
    height: 34,
    justifyContent: 'center',
  },
  selectedAddressText: {
    color: '#3e414b',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28,
  },
  placeNameInput: {
    borderColor: '#dedfe4',
    borderRadius: 15,
    borderWidth: 1,
    color: '#1d2028',
    fontSize: 20,
    fontWeight: '600',
    height: 58,
    marginTop: 14,
    paddingHorizontal: 20,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#ff1956',
    borderRadius: 13,
    height: 58,
    justifyContent: 'center',
    marginTop: 16,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
});

export default LocationStep;
