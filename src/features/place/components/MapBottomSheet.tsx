import React, { useState } from 'react';
import {
  Animated,
  GestureResponderHandlers,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Path, Polygon } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CheckInAsset from '../../../assets/v2icon/checkin_svg.svg';
import MapAsset from '../../../assets/v2icon/maping_svg.svg';
import PlaceRecommendAsset from '../../../assets/v2icon/placerecommend_svg.svg';
import StarAsset from '../../../assets/v2icon/star_svg.svg';
import type { BottomSheetSnapPoint } from '../hooks/useBottomSheet';
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

const FilledStarIcon = ({ active = false, size = 25 }: IconProps) => (
  <Svg height={size} viewBox="0 0 24 24" width={size}>
    <Polygon
      fill={active ? '#FF245B' : 'none'}
      points="12,2.3 14.9,8.2 21.4,9.1 16.7,13.7 17.8,20.2 12,17.1 6.2,20.2 7.3,13.7 2.6,9.1 9.1,8.2"
      stroke={active ? '#FF245B' : '#383B43'}
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </Svg>
);

const TrendPin = () => (
  <Svg height={15} viewBox="0 0 20 20" width={15}>
    <Path d="M10 18s5.5-4.7 5.5-10A5.5 5.5 0 1 0 4.5 8c0 5.3 5.5 10 5.5 10Z" fill="#858892" />
    <Circle cx="10" cy="8" fill="#F7F7F9" r="2" />
  </Svg>
);

const CARD_COLORS = [
  ['#28233C', '#8B315A', '#F1A147'],
  ['#132A42', '#155C6C', '#E1AE69'],
  ['#39252A', '#945045', '#F0BE7C'],
  ['#172E31', '#3C746B', '#E3A56D'],
] as const;

const CARD_FALLBACKS = [
  '오아시스 팝업 스토어',
  '성수 스튜디오 마켓',
  '레이어드 커피 랩',
  '커먼 테이블 성수',
];

const formatDistance = (place: DecisionPlace) => {
  if (place.distanceMeters !== undefined) {
    return place.distanceMeters >= 1000
      ? `${(place.distanceMeters / 1000).toFixed(1)}km`
      : `${Math.round(place.distanceMeters)}m`;
  }

  return place.distance;
};

const PlaceArtwork = ({ index }: { index: number }) => {
  const colors = CARD_COLORS[index % CARD_COLORS.length];

  return (
    <View style={[styles.artwork, { backgroundColor: colors[0] }]}>
      <View style={[styles.artworkGlow, { backgroundColor: colors[1] }]} />
      <View style={[styles.artworkFloor, { backgroundColor: colors[2] }]} />
      <View style={styles.artworkSign}>
        <Text style={styles.artworkSignText}>{index % 2 === 0 ? 'POP-UP' : 'LOCAL'}</Text>
      </View>
      <View style={styles.artworkShelf}>
        <View style={styles.artworkBoxTall} />
        <View style={styles.artworkBox} />
        <View style={styles.artworkBoxSmall} />
      </View>
    </View>
  );
};

const PlaceTrendCard = ({
  index,
  onPress,
  place,
}: {
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
      <PlaceArtwork index={index} />
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
          {liked ? <FilledStarIcon active size={29} /> : <StarAsset height={29} width={30} />}
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
  onBack,
  onDetail,
  place,
}: {
  onBack: () => void;
  onDetail: () => void;
  place: DecisionPlace;
}) => (
  <View style={styles.previewContent}>
    <Pressable onPress={onBack} style={styles.previewBack}>
      <Text style={styles.previewBackText}>‹  주변 핫플로 돌아가기</Text>
    </Pressable>
    <Pressable onPress={onDetail} style={({ pressed }) => [styles.previewPanel, pressed && styles.pressed]}>
      <PlaceArtwork index={place.id} />
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
        <MapAsset height={24} width={22} />
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
          <View style={styles.segmentOuter}>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: feed === 'local' }}
              onPress={() => setFeed('local')}
              style={[styles.segment, feed === 'local' && styles.segmentActive]}
            >
              <Text style={styles.fireIcon}>♥</Text>
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
              <TrendPin />
              <Text style={[styles.segmentLabel, feed === 'national' && styles.segmentLabelActive]}>
                전국 트렌드
              </Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.cardRow}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {shownPlaces.length > 0 ? shownPlaces.slice(0, 6).map((place, index) => (
              <PlaceTrendCard
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
    height: 132,
    overflow: 'hidden',
  },
  artworkBox: { backgroundColor: '#E6D0B1', height: 34, marginLeft: 4, width: 34 },
  artworkBoxSmall: { backgroundColor: '#9C6D51', height: 23, marginLeft: 5, width: 25 },
  artworkBoxTall: { backgroundColor: '#D8E1D2', height: 49, width: 29 },
  artworkFloor: {
    bottom: -40,
    height: 105,
    left: -15,
    opacity: 0.92,
    position: 'absolute',
    transform: [{ rotate: '-7deg' }],
    width: 260,
  },
  artworkGlow: {
    borderRadius: 80,
    height: 155,
    opacity: 0.68,
    position: 'absolute',
    right: -36,
    top: -42,
    width: 155,
  },
  artworkShelf: {
    alignItems: 'flex-end',
    bottom: 13,
    flexDirection: 'row',
    left: 17,
    position: 'absolute',
  },
  artworkSign: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
    position: 'absolute',
    right: 12,
    top: 13,
    transform: [{ rotate: '4deg' }],
  },
  artworkSignText: { color: '#292934', fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
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
    paddingHorizontal: 16,
    paddingTop: 14,
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
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    marginBottom: 8,
    width: 44,
  },
  emptyCardTitle: { color: '#30323A', fontSize: 14, fontWeight: '800' },
  favoriteButton: { bottom: 13, position: 'absolute', right: 11 },
  fireIcon: { color: '#FF245B', fontSize: 17, transform: [{ rotate: '-10deg' }] },
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
    height: 195,
    overflow: 'hidden',
    shadowColor: '#12161D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    width: 245,
  },
  placeCardBody: { flex: 1, paddingHorizontal: 11, paddingTop: 9 },
  placeCardDistance: { color: '#73757D', fontSize: 11, marginTop: 2 },
  placeCardName: { color: '#25272D', fontSize: 15, fontWeight: '800', paddingRight: 35 },
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
    borderRadius: 22,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    height: 40,
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: 'rgba(255,255,255,0.84)',
    elevation: 2,
    shadowColor: '#171A20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  segmentLabel: { color: '#8A8C94', fontSize: 13, fontWeight: '800' },
  segmentLabelActive: { color: '#FF245B' },
  segmentOuter: {
    alignSelf: 'center',
    backgroundColor: 'rgba(222,224,228,0.54)',
    borderColor: 'rgba(255,255,255,0.72)',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    height: 44,
    padding: 2,
    width: '88%',
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
