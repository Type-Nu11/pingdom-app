import * as Location from 'expo-location';
import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import MypingIcon from '../../../assets/icons/Myping.svg';
import KakaoMapCard, { KakaoMapCameraIdleEvent } from '../components/KakaoMapCard';
import { clamp } from '../constants/mapLayout';

type PlaceCreateFlowScreenProps = {
  onClose: () => void;
};

type Step = 1 | 2 | 3;

const SELECTED_PLACE = {
  address: '대구 달성군 창리로 11길 93',
  lat: 35.66352,
  lng: 128.41435,
  name: '고양종합운동장',
};

const formatAddress = (address: Location.LocationGeocodedAddress | undefined) => {
  if (!address) {
    return '';
  }

  return [
    address.region,
    address.city ?? address.subregion,
    address.district,
    address.street,
    address.streetNumber,
  ]
    .filter(Boolean)
    .join(' ');
};

const PlaceCreateFlowScreen = ({ onClose }: PlaceCreateFlowScreenProps) => {
  const [step, setStep] = useState<Step>(1);
  const { width, height } = useWindowDimensions();
  const maxContentWidth = Math.min(width, 560);
  const mapHeight = Math.round(clamp(height * 0.46, 310, 430));

  const goBack = () => {
    if (step === 1) {
      onClose();
      return;
    }

    setStep((currentStep) => (currentStep - 1) as Step);
  };

  const goNext = () => {
    if (step === 3) {
      onClose();
      return;
    }

    setStep((currentStep) => (currentStep + 1) as Step);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fafafa" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <View style={[styles.screen, { maxWidth: maxContentWidth }]}>
          <Header step={step} onBack={goBack} onNext={step === 2 ? goNext : undefined} />

          {step === 1 ? (
            <LocationStep mapHeight={mapHeight} onNext={goNext} />
          ) : step === 2 ? (
            <PhotoSelectStep />
          ) : (
            <CaptionStep onUpload={goNext} />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

type HeaderProps = {
  onBack: () => void;
  onNext?: () => void;
  step: Step;
};

const Header = ({ onBack, onNext, step }: HeaderProps) => (
  <View style={styles.header}>
    <Pressable accessibilityRole="button" accessibilityLabel="뒤로가기" hitSlop={12} onPress={onBack}>
      <Text style={styles.backText}>{'<'}</Text>
    </Pressable>
    <ProgressDots step={step} />
    {onNext ? (
      <Pressable accessibilityRole="button" accessibilityLabel="다음" hitSlop={12} onPress={onNext}>
        <Text style={styles.nextText}>다음</Text>
      </Pressable>
    ) : (
      <View style={styles.headerSpacer} />
    )}
  </View>
);

const ProgressDots = ({ step }: { step: Step }) => (
  <View style={styles.progressRow}>
    {[1, 2, 3].map((item) => (
      <View
        key={item}
        style={[
          styles.progressDot,
          item === step && styles.progressActive,
          item < step && styles.progressDone,
        ]}
      />
    ))}
  </View>
);

type LocationStepProps = {
  mapHeight: number;
  onNext: () => void;
};

const LocationStep = ({ mapHeight, onNext }: LocationStepProps) => (
  <LocationStepContent mapHeight={mapHeight} onNext={onNext} />
);

const LocationStepContent = ({ mapHeight, onNext }: LocationStepProps) => {
  const [addressQuery, setAddressQuery] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(SELECTED_PLACE.address);
  const [detailAddress, setDetailAddress] = useState('');
  const geocodeRequestIdRef = useRef(0);

  const handleCameraIdle = async (event: KakaoMapCameraIdleEvent) => {
    const { lat, lng } = event.nativeEvent;
    const requestId = ++geocodeRequestIdRef.current;

    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });
      const nextAddress = formatAddress(addresses[0]);

      if (requestId === geocodeRequestIdRef.current && nextAddress) {
        setSelectedAddress(nextAddress);
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

const PhotoSelectStep = () => (
  <ScrollView style={styles.photoScroll} contentContainerStyle={styles.photoContent}>
    <Text style={styles.title}>새로 게시할 장소의{'\n'}사진을 선택해 주세요.</Text>
    <View style={styles.photoGrid}>
      {Array.from({ length: 15 }).map((_, index) => (
        <ExamplePhoto key={index} />
      ))}
    </View>
  </ScrollView>
);

const CaptionStep = ({ onUpload }: { onUpload: () => void }) => (
  <View style={styles.captionBody}>
    <View style={styles.authorRow}>
      <View style={styles.profileCircle}>
        <View style={styles.profileHead} />
        <View style={styles.profileBody} />
      </View>
      <View>
        <Text style={styles.username}>woo._sm</Text>
        <Text style={styles.placeName}>{SELECTED_PLACE.name}</Text>
      </View>
    </View>
    <View style={styles.heroPhoto}>
      <ExamplePhoto large />
    </View>
    <TextInput
      multiline
      style={styles.captionInput}
      placeholder="캡션을 입력하세요..."
      placeholderTextColor="#111"
    />
    <Pressable accessibilityRole="button" style={styles.uploadButton} onPress={onUpload}>
      <Text style={styles.uploadText}>업로드</Text>
    </Pressable>
  </View>
);

const ExamplePhoto = ({ large = false }: { large?: boolean }) => (
  <View style={[styles.examplePhoto, large && styles.examplePhotoLarge]}>
    <View style={styles.photoSky} />
    <View style={styles.stadiumRoof}>
      <View style={styles.roofLine} />
      <View style={[styles.roofLine, styles.roofLineSecond]} />
      <View style={[styles.roofLine, styles.roofLineThird]} />
    </View>
    <View style={styles.photoBuilding}>
      <View style={styles.poster} />
      <View style={[styles.poster, styles.posterRight]} />
    </View>
    <View style={styles.photoCrowd}>
      {Array.from({ length: large ? 18 : 8 }).map((_, index) => (
        <View key={index} style={styles.person} />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fafafa',
    flex: 1,
  },
  keyboardAvoidingView: {
    alignItems: 'center',
    flex: 1,
  },
  screen: {
    backgroundColor: '#fafafa',
    flex: 1,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 14,
    height: 72,
  },
  backText: {
    color: '#050505',
    fontSize: 36,
    fontWeight: '400',
    lineHeight: 38,
  },
  nextText: {
    color: '#ff1956',
    fontSize: 21,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 36,
  },
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  progressDot: {
    backgroundColor: '#dedfe4',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  progressActive: {
    backgroundColor: '#ff1956',
    width: 28,
  },
  progressDone: {
    backgroundColor: '#ff1956',
  },
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
  photoScroll: {
    flex: 1,
  },
  photoContent: {
    paddingBottom: 28,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 28,
  },
  examplePhoto: {
    aspectRatio: 1,
    backgroundColor: '#11151f',
    borderColor: '#f1f1f4',
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    width: '33.3333%',
  },
  examplePhotoLarge: {
    borderWidth: 0,
    height: '100%',
    width: '100%',
  },
  photoSky: {
    backgroundColor: '#11141b',
    height: '28%',
  },
  stadiumRoof: {
    backgroundColor: '#d9d1c4',
    height: '22%',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  roofLine: {
    backgroundColor: '#f8f2e8',
    height: 3,
    left: '8%',
    position: 'absolute',
    top: '26%',
    transform: [{ rotate: '-18deg' }],
    width: '82%',
  },
  roofLineSecond: {
    top: '48%',
    transform: [{ rotate: '16deg' }],
  },
  roofLineThird: {
    top: '70%',
    transform: [{ rotate: '-8deg' }],
  },
  photoBuilding: {
    backgroundColor: '#bcb1a4',
    flexDirection: 'row',
    height: '27%',
    justifyContent: 'center',
    paddingTop: '4%',
  },
  poster: {
    backgroundColor: '#1d212c',
    borderColor: '#eee7dd',
    borderWidth: 1,
    height: '74%',
    marginHorizontal: 4,
    width: '24%',
  },
  posterRight: {
    backgroundColor: '#313643',
  },
  photoCrowd: {
    alignItems: 'flex-end',
    backgroundColor: '#4b4038',
    flexDirection: 'row',
    gap: 3,
    height: '23%',
    justifyContent: 'center',
    paddingBottom: 5,
  },
  person: {
    backgroundColor: '#f0e7df',
    borderRadius: 6,
    height: '34%',
    width: 6,
  },
  captionBody: {
    flex: 1,
  },
  authorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 34,
    paddingTop: 42,
    paddingBottom: 26,
  },
  profileCircle: {
    alignItems: 'center',
    borderColor: '#686b76',
    borderRadius: 22,
    borderWidth: 4,
    height: 44,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 44,
  },
  profileHead: {
    backgroundColor: '#686b76',
    borderRadius: 7,
    height: 14,
    width: 14,
  },
  profileBody: {
    backgroundColor: '#686b76',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    height: 16,
    marginTop: 2,
    width: 28,
  },
  username: {
    color: '#30333c',
    fontSize: 16,
    fontWeight: '600',
  },
  placeName: {
    color: '#111',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  heroPhoto: {
    height: '46%',
    overflow: 'hidden',
    width: '100%',
  },
  captionInput: {
    color: '#111',
    fontSize: 16,
    fontWeight: '700',
    minHeight: 120,
    paddingHorizontal: 34,
    paddingTop: 22,
    textAlignVertical: 'top',
  },
  uploadButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#ff1956',
    borderRadius: 18,
    bottom: 70,
    height: 86,
    justifyContent: 'center',
    position: 'absolute',
    width: '84%',
  },
  uploadText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
  },
});

export default PlaceCreateFlowScreen;
