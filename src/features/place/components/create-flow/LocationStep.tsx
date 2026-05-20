import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MypingIcon from '../../../../assets/icons/Myping.svg';
import { getAddressFromCoordinate } from '../../api/kakaoLocalApi';
import KakaoMapCard, { KakaoMapCameraIdleEvent } from '../KakaoMapCard';
import { SELECTED_PLACE } from './constants';

type LocationStepProps = {
  mapHeight: number;
  onNext: () => void;
};

const LocationStep = ({ mapHeight, onNext }: LocationStepProps) => {
  const [addressQuery, setAddressQuery] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(SELECTED_PLACE.address);
  const [detailAddress, setDetailAddress] = useState('');
  const geocodeRequestIdRef = useRef(0);

  const handleCameraIdle = async (event: KakaoMapCameraIdleEvent) => {
    const { lat, lng } = event.nativeEvent;
    const requestId = ++geocodeRequestIdRef.current;

    try {
      const nextAddress = await getAddressFromCoordinate(lat, lng);

      if (requestId === geocodeRequestIdRef.current) {
        setSelectedAddress(nextAddress || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch {
      if (requestId === geocodeRequestIdRef.current) {
        setSelectedAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    }
  };

  return (
    <View style={styles.stepBody}>
      <Text style={styles.title}>새로 게시할 장소의{'\n'}위치를 선택해 주세요</Text>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="주소를 입력하세요..."
          placeholderTextColor="#777a84"
          value={addressQuery}
          onChangeText={setAddressQuery}
        />
      </View>
      <View style={[styles.mapPreview, { height: mapHeight }]}>
        <KakaoMapCard
          style={styles.map}
          centerLat={SELECTED_PLACE.lat}
          centerLng={SELECTED_PLACE.lng}
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
        <TextInput editable={false} style={styles.addressInput} value={selectedAddress} />
        <TextInput
          style={styles.detailInput}
          placeholder="(선택) 상세 주소 입력"
          placeholderTextColor="#777a84"
          value={detailAddress}
          onChangeText={setDetailAddress}
        />
        <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={onNext}>
          <Text style={styles.primaryButtonText}>선택</Text>
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
  primaryButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
});

export default LocationStep;
