import React, { useEffect, useState } from 'react';
import {
  Animated,
  GestureResponderHandlers,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CheckInAsset from '../../../assets/v2icon/checkin_svg.svg';
import HotPlaceAsset from '../../../assets/v2icon/hotplace.svg';
import MapAsset from '../../../assets/v2icon/maping_svg.svg';
import PlaceRecommendAsset from '../../../assets/v2icon/placerecommend_svg.svg';
import StarAsset from '../../../assets/v2icon/star_svg.svg';
import type { BottomSheetSnapPoint } from '../hooks/useBottomSheet';
import { usePlacePreviewImages } from '../hooks/usePlacePreviewImages';
import GlassSurface from './GlassSurface';

export type BottomSheetContent =
  | { type: 'home' }
  | { type: 'search'; query: string }
  | { type: 'results'; query: string }
  | { type: 'place-preview'; placeId: number };

export type VisitFilter = 'Open now' | 'Short wait' | 'Coupon' | 'Bookable';

export type DecisionPlace = {
  address: string;
  category: string;
  distance: string;
  distanceMeters?: number;
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  tags: string[];
  verifiedAgo: string;
  verifiedMinutes?: number;
  wait: string;
  waitMinutes?: [number, number];
};

type MapBottomSheetProps = {
  activeFilters: VisitFilter[];
  content: BottomSheetContent;
  height: number;
  onBackHome: () => void;
  onCouponPress: (place: DecisionPlace) => void;
  onCreatePlace?: () => void;
  onDetailPress: (place: DecisionPlace) => void;
  onFilterPress: (filter: VisitFilter) => void;
  onGoNowPress: (place: DecisionPlace) => void;
  onHandlePress: () => void;
  onOpenLikedPlaces?: () => void;
  onOpenSavedPlaces?: () => void;
  onPlacePress: (place: DecisionPlace) => void;
  onProfilePress?: () => void;
  onQueryChange: (query: string) => void;
  onSearchFocus: () => void;
  onSubmitSearch: () => void;
  panHandlers: GestureResponderHandlers;
  places: DecisionPlace[];
  selectedPlace: DecisionPlace | null;
  sheetChromeBottom: Animated.Value;
  sheetTranslateY: Animated.Value;
  snapPoint: BottomSheetSnapPoint;
};

type IconProps = {
  active?: boolean;
  size?: number;
};

const MapPinIcon = ({ active = false, size = 24 }: IconProps) => (
  <Svg height={size} viewBox="0 0 24 24" width={size}>
    <Path
      d="M12 22s7-6.1 7-13A7 7 0 0 0 5 9c0 6.9 7 13 7 13Z"
      fill={active ? '#FF245B' : 'none'}
      stroke={active ? '#FF245B' : '#383B43'}
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <Circle cx="12" cy="9" fill={active ? '#FFFFFF' : 'none'} r="2.4" stroke={active ? '#FFFFFF' : '#383B43'} strokeWidth="1.5" />
  </Svg>
);

const FavoriteStarIcon = ({ active = false, size = 30 }: IconProps) => (
  <Svg height={size} viewBox="0 0 25 24" width={size}>
    <Path
      d="M1.18994 9.91674C0.824483 9.57878 1.023 8.9678 1.51731 8.90919L8.52148 8.07842C8.72295 8.05453 8.89794 7.92802 8.98291 7.7438L11.9372 1.33905C12.1457 0.887041 12.7883 0.886954 12.9967 1.33896L15.951 7.74367C16.036 7.92789 16.2098 8.05474 16.4113 8.07863L23.4159 8.90919C23.9102 8.9678 24.1081 9.57896 23.7427 9.91692L18.5649 14.7061C18.4159 14.8438 18.3496 15.0488 18.3892 15.2478L19.7633 22.1658C19.8603 22.654 19.3407 23.0323 18.9064 22.7892L12.7518 19.3432C12.5748 19.2441 12.3597 19.2446 12.1827 19.3437L6.0275 22.7883C5.59314 23.0314 5.07259 22.654 5.1696 22.1658L6.54399 15.2482C6.58352 15.0493 6.51738 14.8438 6.36843 14.706L1.18994 9.91674Z"
      fill={active ? '#FF245B' : 'none'}
      stroke={active ? '#FF245B' : '#383B43'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </Svg>
);

const CARD_FALLBACKS = [
  '오아시스 팝업 스토어',
  '성수 스튜디오 마켓',
  '레이어드 커피 랩',
  '커먼 테이블 성수',
];

const PLACEHOLDER_IMAGE_URL = 'https://placehold.co/520x280.png';

const formatDistance = (place: DecisionPlace) => {
  if (place.distanceMeters !== undefined) {
    return place.distanceMeters >= 1000
      ? `${(place.distanceMeters / 1000).toFixed(1)}km`
      : `${Math.round(place.distanceMeters)}m`;
  }

  return place.distance;
};

const PlaceArtwork = ({ imageUrl }: { imageUrl?: string }) => {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  const sourceUrl = imageUrl && !hasImageError ? imageUrl : PLACEHOLDER_IMAGE_URL;

  return (
    <Image
      onError={() => {
        if (sourceUrl !== PLACEHOLDER_IMAGE_URL) setHasImageError(true);
      }}
      resizeMode="cover"
      source={{ uri: sourceUrl }}
      style={styles.artwork}
    />
  );
};

const PlaceTrendCard = ({
  imageUrl,
  index,
  onPress,
  place,
}: {
  imageUrl?: string;
  index: number;
  onPress: () => void;
  place: DecisionPlace;
}) => {
  const [liked, setLiked] = useState(false);

  return (
    <Pressable
      accessibilityLabel={`${place.name}, ${formatDistance(place)}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.placeCard, pressed && styles.pressed]}
    >
      <PlaceArtwork imageUrl={imageUrl} />
      <View style={styles.placeCardBody}>
        <Text numberOfLines={1} style={styles.placeCardName}>
          {place.name || CARD_FALLBACKS[index % CARD_FALLBACKS.length]}
        </Text>
        <Text numberOfLines={1} style={styles.placeCardDistance}>
          여기서 {formatDistance(place)}
        </Text>
        <Pressable
          accessibilityLabel={liked ? '즐겨찾기 해제' : '즐겨찾기'}
          accessibilityRole="button"
          hitSlop={10}
          onPress={(event) => {
            event.stopPropagation();
            setLiked((current) => !current);
          }}
          style={styles.favoriteButton}
        >
          <FavoriteStarIcon active={liked} />
        </Pressable>
      </View>
    </Pressable>
  );
};

const EmptyCard = () => (
  <View style={[styles.placeCard, styles.emptyCard]}>
    <View style={styles.emptyCardIcon}><MapPinIcon active size={24} /></View>
    <Text style={styles.emptyCardTitle}>주변 핫플을 찾는 중이에요</Text>
    <Text style={styles.emptyCardBody}>지도를 움직여 다른 지역도 둘러보세요.</Text>
  </View>
);

const ResultRow = ({
  onPress,
  place,
}: {
  onPress: () => void;
  place: DecisionPlace;
}) => (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.resultRow, pressed && styles.pressed]}>
    <View style={styles.resultThumbnail}><MapPinIcon active size={25} /></View>
    <View style={styles.resultTextBody}>
      <Text numberOfLines={1} style={styles.resultName}>{place.name}</Text>
      <Text numberOfLines={1} style={styles.resultAddress}>{place.address}</Text>
    </View>
    <Text style={styles.resultDistance}>{formatDistance(place)}</Text>
  </Pressable>
);

const PreviewContent = ({
  imageUrl,
  onBack,
  onDetail,
  place,
}: {
  imageUrl?: string;
  onBack: () => void;
  onDetail: () => void;
  place: DecisionPlace;
}) => (
  <View style={styles.previewContent}>
    <Pressable onPress={onBack} style={styles.previewBack}>
      <Text style={styles.previewBackText}>‹  주변 핫플로 돌아가기</Text>
    </Pressable>
    <Pressable onPress={onDetail} style={({ pressed }) => [styles.previewPanel, pressed && styles.pressed]}>
      <PlaceArtwork imageUrl={imageUrl} />
      <View style={styles.previewBody}>
        <Text style={styles.previewName}>{place.name}</Text>
        <Text numberOfLines={2} style={styles.previewAddress}>{place.address}</Text>
        <View style={styles.previewMeta}>
          <Text style={styles.previewDistance}>여기서 {formatDistance(place)}</Text>
          <Text style={styles.previewMore}>상세보기  ›</Text>
        </View>
      </View>
    </Pressable>
  </View>
);

const BottomNavigation = ({
  bottomInset,
  onCreatePlace,
  onOpenLikedPlaces,
  onOpenSavedPlaces,
  sheetTranslateY,
}: {
  bottomInset: number;
  onCreatePlace?: () => void;
  onOpenLikedPlaces?: () => void;
  onOpenSavedPlaces?: () => void;
  sheetTranslateY: Animated.Value;
}) => (
  <Animated.View
    style={[
      styles.navigationRow,
      {
        bottom: Math.max(12, bottomInset),
        transform: [{ translateY: Animated.multiply(sheetTranslateY, -1) }],
      },
    ]}
  >
    <GlassSurface interactive style={styles.navigationGlass} tintColor="rgba(255,255,255,0.24)">
      <Pressable accessibilityRole="button" style={styles.navItem}>
        <MapAsset color="#FF1956" height={24} width={22} />
        <Text style={[styles.navLabel, styles.navLabelActive]}>지도</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onOpenLikedPlaces} style={styles.navItem}>
        <StarAsset height={24} width={25} />
        <Text style={styles.navLabel}>즐겨찾기</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={onOpenSavedPlaces} style={styles.navItem}>
        <CheckInAsset height={24} width={23} />
        <Text style={styles.navLabel}>체크인</Text>
      </Pressable>
    </GlassSurface>
    <Pressable
      accessibilityLabel="장소 등록"
      accessibilityRole="button"
      onPress={onCreatePlace}
      style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]}
    >
      <GlassSurface interactive style={styles.sendGlass} tintColor="rgba(255,255,255,0.25)">
        <PlaceRecommendAsset height={27} width={27} />
      </GlassSurface>
    </Pressable>
  </Animated.View>
);

export default function MapBottomSheet({
  content,
  height,
  onBackHome,
  onCreatePlace,
  onDetailPress,
  onHandlePress,
  onOpenLikedPlaces,
  onOpenSavedPlaces,
  onPlacePress,
  panHandlers,
  places,
  selectedPlace,
  sheetChromeBottom,
  sheetTranslateY,
  snapPoint,
}: MapBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const [feed, setFeed] = useState<'local' | 'national'>('local');
  const query = content.type === 'search' || content.type === 'results' ? content.query.trim() : '';
  const isSearchMode = content.type === 'search' || content.type === 'results' || snapPoint === 'expanded';
  const shownPlaces = feed === 'local' ? places : [...places].reverse();
  const { imageUrlsByPlaceId } = usePlacePreviewImages(places);

  return (
    <Animated.View
      style={[styles.bottomSheet, { height, transform: [{ translateY: sheetTranslateY }] }]}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.sheetChrome, { bottom: sheetChromeBottom }]}
      >
        <GlassSurface
          intensity={82}
          style={styles.sheetGlass}
          tintColor="rgba(255,255,255,0.22)"
        />
        <View style={styles.sheetTint} />
      </Animated.View>
      <View style={styles.handleArea} {...panHandlers}>
        <Pressable
          accessibilityLabel="추천 패널 크기 조절"
          accessibilityRole="adjustable"
          onPress={onHandlePress}
          style={styles.handleButton}
        >
          <View style={styles.handle} />
        </Pressable>
      </View>

      {content.type === 'place-preview' && selectedPlace ? (
        <PreviewContent
          imageUrl={imageUrlsByPlaceId[String(selectedPlace.id)]}
          onBack={onBackHome}
          onDetail={() => onDetailPress(selectedPlace)}
          place={selectedPlace}
        />
      ) : isSearchMode ? (
        <ScrollView
          contentContainerStyle={styles.resultsContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultsTitleRow}>
            <Text style={styles.resultsTitle}>{query ? `“${query}” 검색 결과` : '내 주변 장소'}</Text>
            <Text style={styles.resultsCount}>{places.length}</Text>
          </View>
          {places.length > 0 ? places.map((place) => (
            <ResultRow key={place.id} onPress={() => onPlacePress(place)} place={place} />
          )) : <EmptyCard />}
        </ScrollView>
      ) : (
        <>
          <View style={styles.segmentShadow}>
            <GlassSurface
              intensity={36}
              style={styles.segmentOuter}
              tintColor="rgba(228,228,230,0.12)"
            >
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: feed === 'local' }}
                onPress={() => setFeed('local')}
                style={[styles.segment, feed === 'local' && styles.segmentActive]}
              >
                <HotPlaceAsset
                  color={feed === 'local' ? '#FF1956' : '#767680'}
                  height={20}
                  width={16}
                />
                <Text style={[styles.segmentLabel, feed === 'local' && styles.segmentLabelActive]}>
                  우리 지역 핫플
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: feed === 'national' }}
                onPress={() => setFeed('national')}
                style={[styles.segment, feed === 'national' && styles.segmentActive]}
              >
                <MapAsset
                  color={feed === 'national' ? '#FF1956' : '#767680'}
                  height={20}
                  width={18}
                />
                <Text style={[styles.segmentLabel, feed === 'national' && styles.segmentLabelActive]}>
                  전국 트렌드
                </Text>
              </Pressable>
            </GlassSurface>
          </View>

          <ScrollView
            contentContainerStyle={styles.cardRow}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {shownPlaces.length > 0 ? shownPlaces.slice(0, 6).map((place, index) => (
              <PlaceTrendCard
                imageUrl={imageUrlsByPlaceId[String(place.id)]}
                index={index}
                key={place.id}
                onPress={() => onPlacePress(place)}
                place={place}
              />
            )) : <EmptyCard />}
          </ScrollView>
        </>
      )}

      <BottomNavigation
        bottomInset={insets.bottom}
        onCreatePlace={onCreatePlace}
        onOpenLikedPlaces={onOpenLikedPlaces}
        onOpenSavedPlaces={onOpenSavedPlaces}
        sheetTranslateY={sheetTranslateY}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  artwork: {
    backgroundColor: '#E4E4E6',
    height: 140,
    overflow: 'hidden',
    width: '100%',
  },
  bottomSheet: {
    bottom: 8,
    left: 8,
    overflow: 'visible',
    position: 'absolute',
    right: 8,
    zIndex: 50,
  },
  sheetChrome: {
    backgroundColor: 'rgba(244,246,248,0.44)',
    borderColor: 'rgba(255,255,255,0.86)',
    borderRadius: 36,
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
    borderWidth: 1,
    elevation: 22,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    shadowColor: '#10141A',
    shadowOffset: { width: 0, height: -7 },
    shadowOpacity: 0.17,
    shadowRadius: 24,
    top: 0,
  },
  cardRow: {
    gap: 12,
    paddingBottom: 12,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  emptyCardBody: { color: '#81838C', fontSize: 11, marginTop: 4, textAlign: 'center' },
  emptyCardIcon: {
    alignItems: 'center',
    backgroundColor: '#FFF0F4',
    borderRadius: 20,
    height: 44,
    justifyContent: 'center',
    marginBottom: 8,
    width: 44,
  },
  emptyCardTitle: { color: '#30323A', fontSize: 14, fontWeight: '800' },
  favoriteButton: { bottom: 13, position: 'absolute', right: 11 },
  handle: { backgroundColor: 'rgba(80,83,91,0.26)', borderRadius: 3, height: 5, width: 55 },
  handleArea: { alignItems: 'center', height: 23, justifyContent: 'center' },
  handleButton: { alignItems: 'center', height: 44, justifyContent: 'center', width: 80 },
  navItem: { alignItems: 'center', flex: 1, gap: 2, height: 59, justifyContent: 'center' },
  navLabel: { color: '#3E4149', fontSize: 10, fontWeight: '700' },
  navLabelActive: { color: '#FF245B' },
  navigationGlass: {
    borderColor: 'rgba(255,255,255,0.82)',
    borderRadius: 30,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    height: 62,
    overflow: 'hidden',
  },
  navigationRow: {
    bottom: 12,
    flexDirection: 'row',
    gap: 10,
    left: 16,
    position: 'absolute',
    right: 16,
  },
  placeCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    borderWidth: 1,
    height: 210,
    overflow: 'hidden',
    shadowColor: '#12161D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    width: 260,
  },
  placeCardBody: { flex: 1, paddingHorizontal: 11, paddingTop: 9 },
  placeCardDistance: { color: '#73757D', fontSize: 12, marginTop: 2 },
  placeCardName: { color: '#25272D', fontSize: 16, fontWeight: '900', paddingRight: 35 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
  previewAddress: { color: '#747780', fontSize: 12, marginTop: 4 },
  previewBack: { alignSelf: 'flex-start', minHeight: 36, justifyContent: 'center' },
  previewBackText: { color: '#5E616A', fontSize: 12, fontWeight: '700' },
  previewBody: { padding: 14 },
  previewContent: { paddingHorizontal: 16 },
  previewDistance: { color: '#6D7079', fontSize: 12 },
  previewMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  previewMore: { color: '#FF245B', fontSize: 12, fontWeight: '800' },
  previewName: { color: '#22242A', fontSize: 18, fontWeight: '900' },
  previewPanel: {
    backgroundColor: 'rgba(255,255,255,0.84)',
    borderRadius: 18,
    overflow: 'hidden',
  },
  resultAddress: { color: '#7A7D85', fontSize: 11, marginTop: 3 },
  resultDistance: { color: '#686B73', fontSize: 11, fontWeight: '700' },
  resultName: { color: '#272930', fontSize: 14, fontWeight: '800' },
  resultRow: {
    alignItems: 'center',
    borderBottomColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 11,
    minHeight: 72,
  },
  resultTextBody: { flex: 1 },
  resultThumbnail: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,240,244,0.86)',
    borderRadius: 13,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  resultsContent: { paddingBottom: 105, paddingHorizontal: 17 },
  resultsCount: { color: '#FF245B', fontSize: 13, fontWeight: '900' },
  resultsTitle: { color: '#24262C', flex: 1, fontSize: 18, fontWeight: '900' },
  resultsTitleRow: { alignItems: 'center', flexDirection: 'row', gap: 8, paddingBottom: 8, paddingTop: 6 },
  segment: {
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: 22,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  segmentLabel: {
    color: '#767680',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 21,
  },
  segmentLabelActive: { color: '#FF1956', fontWeight: '700' },
  segmentOuter: {
    alignItems: 'stretch',
    backgroundColor: 'rgba(228,228,230,0.48)',
    borderColor: 'rgba(255,255,255,0.52)',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    height: 52,
    overflow: 'hidden',
    padding: 3,
    width: '100%',
  },
  segmentShadow: {
    alignSelf: 'center',
    borderRadius: 24,
    maxWidth: 370,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    width: '100%',
  },
  sendButton: {
    borderRadius: 31,
    height: 62,
    shadowColor: '#11151B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    width: 62,
  },
  sendGlass: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.86)',
    borderRadius: 31,
    borderWidth: 1,
    height: 62,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 62,
  },
  sheetGlass: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 36,
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
    overflow: 'hidden',
  },
  sheetTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(247,249,251,0.18)',
  },
});
