import { useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
  const [addressQuery, setAddressQuery] = useState('');
  const [placeName, setPlaceName] = useState(initialValue?.name ?? '');
  const [selectedAddress, setSelectedAddress] = useState(
    initialValue?.address ?? '장소를 검색해 선택해 주세요'
  );
  const [selectedKakaoPlaceId, setSelectedKakaoPlaceId] = useState(initialValue?.kakaoPlaceId);
  const [selectedPlaceCoordinate, setSelectedPlaceCoordinate] = useState<Coordinate | null>(
    initialValue ? { lat: initialValue.latitude, lng: initialValue.longitude } : null
  );
  const [detailAddress, setDetailAddress] = useState('');
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
  const isSelectedAddressInvalid = selectedAddress === '검색 결과가 없습니다'
    || selectedAddress === '주소 검색에 실패했습니다'
    || selectedAddress === '장소를 검색해 선택해 주세요';
  const isSelectionDisabled = !placeName.trim()
    || !selectedKakaoPlaceId
    || isSelectedAddressInvalid
    || isSubmitting;

  const applySearchResult = (result: KakaoLocalSearchItem) => {
    const nextAddress = result.roadAddress || result.address;

    Keyboard.dismiss();
    setAddressQuery(result.name);
    setMapCenter({ lat: result.lat, lng: result.lng });
    setSelectedCoordinate({ lat: result.lat, lng: result.lng });
    setSelectedPlaceCoordinate({ lat: result.lat, lng: result.lng });
    setSelectedAddress(nextAddress);
    setSelectedKakaoPlaceId(result.kakaoPlaceId);
    setPlaceName(result.name || nextAddress);
    clearSearchResults();
  };

  const handleCameraIdle = async (event: KakaoMapCameraIdleEvent) => {
    const { lat, lng } = event.nativeEvent;
    const nextCoordinate = { lat, lng };

    setSelectedCoordinate(nextCoordinate);

    if (selectedPlaceCoordinate && !isSameCoordinate(nextCoordinate, selectedPlaceCoordinate)) {
      setAddressQuery('');
      setPlaceName('');
      setSelectedKakaoPlaceId(undefined);
      setSelectedPlaceCoordinate(null);
    }

    const nextAddress = await resolveAddressFromCoordinate(lat, lng);

    if (nextAddress) {
      setSelectedAddress(nextAddress);
    }
  };

  const handleSearchAddress = async () => {
    await searchPlaces(addressQuery, {
      centerLat: selectedCoordinate.lat,
      centerLng: selectedCoordinate.lng,
    });
  };

  const handleSelectLocation = () => {
    const trimmedName = placeName.trim();
    const trimmedDetailAddress = detailAddress.trim();
    if (!trimmedName || isSelectionDisabled) {
      return;
    }
    void onNext({
      address: trimmedDetailAddress ? selectedAddress + ' ' + trimmedDetailAddress : selectedAddress,
      kakaoPlaceId: selectedKakaoPlaceId,
      latitude: selectedCoordinate.lat,
      longitude: selectedCoordinate.lng,
      name: trimmedName,
    });
  };

  return (
    <View style={styles.stepBody}>
      <Text style={styles.title}>새로 게시할 장소의{'\n'}위치를 선택해 주세요</Text>
      <View style={styles.searchBox}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="주소 검색"
          disabled={isSearchingAddress}
          hitSlop={8}
          onPress={handleSearchAddress}
        >
          <Text style={styles.searchIcon}>⌕</Text>
        </Pressable>
        <TextInput
          style={styles.searchInput}
          placeholder="주소를 입력하세요..."
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
          <Text style={styles.searchStatusInlineText}>주소를 찾고 있어요</Text>
        </View>
      ) : searchStatusMessage ? (
        <Text style={styles.searchStatusText}>{searchStatusMessage}</Text>
      ) : null}
      {searchResults.length > 0 ? (
        <View style={styles.searchResultList}>
          {searchResults.slice(0, 5).map((result) => {
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
        <TextInput
          style={styles.placeNameInput}
          placeholder="장소 이름을 입력해 주세요"
          placeholderTextColor="#777a84"
          value={placeName}
          onChangeText={setPlaceName}
        />
        <TextInput editable={false} style={styles.addressInput} value={selectedAddress} />
        <TextInput
          style={styles.detailInput}
          placeholder="(선택) 상세 주소 입력"
          placeholderTextColor="#777a84"
          value={detailAddress}
          onChangeText={setDetailAddress}
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
          <Text style={styles.primaryButtonText}>{isSubmitting ? '확인 중...' : '선택'}</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stepBody: {
    flex: 1,
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
    marginTop: 18,
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
    backgroundColor: '#fafafa',
    paddingHorizontal: 34,
    paddingTop: 22,
  },
  placeNameInput: {
    borderColor: '#dedfe4',
    borderRadius: 13,
    borderWidth: 1,
    color: '#1d2028',
    fontSize: 17,
    fontWeight: '700',
    height: 54,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  addressInput: {
    color: '#20232c',
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 14,
    padding: 0,
  },
  detailInput: {
    borderColor: '#dedfe4',
    borderRadius: 13,
    borderWidth: 1,
    color: '#1d2028',
    fontSize: 17,
    fontWeight: '500',
    height: 54,
    paddingHorizontal: 20,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#ff1956',
    borderRadius: 12,
    height: 54,
    justifyContent: 'center',
    marginTop: 14,
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
