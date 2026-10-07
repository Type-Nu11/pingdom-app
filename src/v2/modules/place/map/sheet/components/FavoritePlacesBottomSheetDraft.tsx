import React, { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  GestureResponderHandlers,
  Image,
  Pressable,
  type PressableProps,
  type PressableStateCallbackType,
  type ViewStyle,
  ScrollView,
  Text,
  View,
} from 'react-native';
import styled from 'styled-components/native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ArtAsset from '../../../../../../assets/v2/icons/place/art_svg.svg';
import BeautyAsset from '../../../../../../assets/v2/icons/place/beati_svg.svg';
import CheckInAsset from '../../../../../../assets/v2/icons/place/checkin_svg.svg';
import FashionAsset from '../../../../../../assets/v2/icons/place/fashion_svg.svg';
import FoodAsset from '../../../../../../assets/v2/icons/place/food_svg.svg';
import MapAsset from '../../../../../../assets/v2/icons/place/maping_svg.svg';
import MusicAsset from '../../../../../../assets/v2/icons/place/music_svg.svg';
import MyPlaceAsset from '../../../../../../assets/v2/icons/place/my_place.svg';
import PlaceRecommendAsset from '../../../../../../assets/v2/icons/place/placerecommend.svg';
import type { BottomSheetSnapPoint, DecisionPlace } from '../index';
import { GlassSurface, supportsNativeLiquidGlass } from '../../presentation';

type FavoriteCategory = 'all' | 'music' | 'food' | 'fashion' | 'beauty' | 'art';

type FavoritePlacesBottomSheetProps = {
  collapsedTranslateY: number;
  height: number;
  imageUrlsByPlaceId: Record<string, string[]>;
  hasNextPage: boolean;
  isError: boolean;
  isFetchNextPageError: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isUnauthorized: boolean;
  mediumTranslateY: number;
  onHandlePress: () => void;
  onOpenMap: () => void;
  onOpenRecommendations?: () => void;
  onOpenReservations?: () => void;
  onPlacePress: (place: DecisionPlace) => void;
  onLoadMore: () => void;
  onRemovePlace: (place: DecisionPlace) => void;
  onRetry: () => void;
  panHandlers: GestureResponderHandlers;
  places: DecisionPlace[];
  pendingPlaceIds?: Record<string, boolean>;
  sheetChromeBottom: Animated.Value;
  sheetTranslateY: Animated.Value;
  snapPoint: BottomSheetSnapPoint;
};

const SHEET_RESTING_GAP = 8;
const SHEET_BOTTOM_RADIUS = 48;
const LIQUID_GLASS_AVAILABLE = supportsNativeLiquidGlass();

const categories: Array<{
  Icon?: React.ComponentType<{ color?: string; height: number; width: number }>;
  id: FavoriteCategory;
  label: string;
}> = [
  { id: 'all', label: '전체' },
  { Icon: MusicAsset, id: 'music', label: '음악' },
  { Icon: FoodAsset, id: 'food', label: '음식점' },
  { Icon: FashionAsset, id: 'fashion', label: '패션' },
  { Icon: BeautyAsset, id: 'beauty', label: '뷰티' },
  { Icon: ArtAsset, id: 'art', label: '전시' },
];

const categoryAliases: Record<Exclude<FavoriteCategory, 'all'>, string[]> = {
  art: ['art', 'exhibit', 'exhibition', '전시'],
  beauty: ['beauty', '뷰티'],
  fashion: ['fashion', '패션'],
  food: ['cafe', 'dining', 'food', 'restaurant', '음식', '카페'],
  music: ['music', '음악'],
};

const getCategoryLabel = (place: DecisionPlace) => {
  const category = place.category.toLowerCase();
  if (categoryAliases.music.some((alias) => category.includes(alias))) return '음악';
  if (categoryAliases.food.some((alias) => category.includes(alias))) return '음식점';
  if (categoryAliases.fashion.some((alias) => category.includes(alias))) return '패션';
  if (categoryAliases.beauty.some((alias) => category.includes(alias))) return '뷰티';
  if (categoryAliases.art.some((alias) => category.includes(alias))) return '전시';
  return place.category;
};

const matchesCategory = (place: DecisionPlace, category: FavoriteCategory) => {
  if (category === 'all') return true;
  const value = place.category.toLowerCase();
  return categoryAliases[category].some((alias) => value.includes(alias));
};

const formatDistance = (place: DecisionPlace) => {
  if (place.distanceMeters === undefined) return place.distance;
  return place.distanceMeters>= 1000
    ? `${(place.distanceMeters / 1000).toFixed(1)}km`
    : `${Math.round(place.distanceMeters)}m`;
};

const HeaderStar = () => <MyPlaceAsset height={38} width={38} />;

const ActiveNavStar = () => (
  <Svg height={21} viewBox="0 0 25 24" width={22}>
    <Path
      d="M1.19 9.917c-.366-.338-.167-.949.327-1.008l7.004-.83a.58.58 0 0 0 .462-.335l2.954-6.405c.209-.452.852-.452 1.06 0l2.954 6.405a.58.58 0 0 0 .46.335l7.005.83c.494.06.692.67.327 1.008l-5.178 4.789a.58.58 0 0 0-.176.542l1.374 6.918c.097.488-.423.866-.857.623l-6.154-3.446a.58.58 0 0 0-.57 0l-6.155 3.445c-.434.243-.955-.134-.858-.622l1.375-6.918a.58.58 0 0 0-.176-.542L1.19 9.917Z"
      fill="#FF245B"
    />
  </Svg>
);

const FavoriteImage = ({ uri }: { uri?: string }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => setHasError(false), [uri]);

  if (!uri || hasError) {
    return (
      <ViewPlaceImage style={[styles.imagePlaceholder]}>
        <MyPlaceAsset height={30} width={30} />
      </ViewPlaceImage>
    );
  }

  return (
    <ImagePlaceImage
      onError={() => setHasError(true)}
      resizeMode="cover"
      source={{ uri }}

    />
  );
};

const FavoritePlaceRow = ({
  imageUrls,
  onPress,
  onRemove,
  pending,
  place,
}: {
  imageUrls: string[];
  onPress: () => void;
  onRemove: () => void;
  pending: boolean;
  place: DecisionPlace;
}) => {
  const sources = imageUrls.slice(0, 2);

  return (
    <Pressable
      accessibilityLabel={`${place.name}, ${formatDistance(place)}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.placeRow, pressed && styles.pressed]}
   >
      <ViewPlaceHeading>
        <ViewPlaceText>
          <ViewNameRow>
            <TextPlaceName numberOfLines={1}>{place.name}</TextPlaceName>
            <TextPlaceCategory>{getCategoryLabel(place)}</TextPlaceCategory>
          </ViewNameRow>
          <TextPlaceMeta numberOfLines={1}>
            {formatDistance(place)} · {place.address}
          </TextPlaceMeta>
        </ViewPlaceText>
        <PressableMoreButton
          accessibilityLabel={`${place.name} 즐겨찾기 해제`}
          accessibilityRole="button"
          accessibilityState={{ busy: pending, disabled: pending }}
          disabled={pending}
          hitSlop={10}
          onPress={(event) => {
            event.stopPropagation();
            onRemove();
          }}

       >
          <TextMoreButtonText>⋮</TextMoreButtonText>
        </PressableMoreButton>
      </ViewPlaceHeading>
      <ViewImageRow>
        <FavoriteImage uri={sources[0]} />
        <FavoriteImage uri={sources[1] ?? sources[0]} />
      </ViewImageRow>
    </Pressable>
  );
};

const BottomNavigation = ({
  bottomInset,
  onOpenMap,
  onOpenRecommendations,
  onOpenReservations,
  sheetTranslateY,
}: {
  bottomInset: number;
  onOpenMap: () => void;
  onOpenRecommendations?: () => void;
  onOpenReservations?: () => void;
  sheetTranslateY: Animated.Value;
}) => (
  <AnimatedViewNavigationRow
    style={[

      {
        bottom: Math.max(20, bottomInset + 8),
        transform: [{ translateY: Animated.multiply(sheetTranslateY, -1) }],
      },
    ]}
 >
    <ViewNavigationShadow>
      {LIQUID_GLASS_AVAILABLE ? <GlassSurfaceNavigationBar
        glassEffectStyle="regular"
        intensity={96}

        tintColor="rgba(238,238,242,0.42)"
     >
        <PressableNavItem accessibilityLabel="지도" accessibilityRole="button" onPress={onOpenMap}>
          <MapAsset color="#3B3B40" height={22} width={19} />
          <TextNavLabel>지도</TextNavLabel>
        </PressableNavItem>
        <ViewNavItem style={[styles.navItemActive]}>
          <ActiveNavStar />
          <TextNavLabel style={[styles.navLabelActive]}>즐겨찾기</TextNavLabel>
        </ViewNavItem>
        <PressableNavItem accessibilityLabel="예약" accessibilityRole="button" onPress={onOpenReservations}>
          <CheckInAsset height={22} width={21} />
          <TextNavLabel>예약</TextNavLabel>
        </PressableNavItem>
      </GlassSurfaceNavigationBar> : <ViewNavigationBar style={[styles.navigationBarSolid]}>
        <PressableNavItem accessibilityLabel="지도" accessibilityRole="button" onPress={onOpenMap}>
          <MapAsset color="#3B3B40" height={22} width={19} />
          <TextNavLabel>지도</TextNavLabel>
        </PressableNavItem>
        <ViewNavItem style={[styles.navItemActive]}>
          <ActiveNavStar />
          <TextNavLabel style={[styles.navLabelActive]}>즐겨찾기</TextNavLabel>
        </ViewNavItem>
        <PressableNavItem accessibilityLabel="예약" accessibilityRole="button" onPress={onOpenReservations}>
          <CheckInAsset height={22} width={21} />
          <TextNavLabel>예약</TextNavLabel>
        </PressableNavItem>
      </ViewNavigationBar>}
    </ViewNavigationShadow>
    <Pressable
      accessibilityLabel="장소추천"
      accessibilityRole="button"
      onPress={onOpenRecommendations}
      style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]}
   >
      {LIQUID_GLASS_AVAILABLE ? <GlassSurfaceSendButtonGlass
        glassEffectStyle="regular"
        intensity={96}
        pointerEvents="none"

        tintColor="rgba(238,238,242,0.42)"
     >
        <PlaceRecommendAsset height={23} width={23} />
      </GlassSurfaceSendButtonGlass> : <ViewSendButtonGlass pointerEvents="none" style={[styles.sendButtonSolid]}>
        <PlaceRecommendAsset height={23} width={23} />
      </ViewSendButtonGlass>}
    </Pressable>
  </AnimatedViewNavigationRow>
);

export default function FavoritePlacesBottomSheetDraft({
  collapsedTranslateY,
  hasNextPage,
  height,
  imageUrlsByPlaceId,
  isError,
  isFetchNextPageError,
  isFetchingNextPage,
  isLoading,
  isUnauthorized,
  mediumTranslateY,
  onHandlePress,
  onOpenMap,
  onOpenRecommendations,
  onOpenReservations,
  onPlacePress,
  onLoadMore,
  onRemovePlace,
  onRetry,
  panHandlers,
  places,
  pendingPlaceIds = {},
  sheetChromeBottom,
  sheetTranslateY,
  snapPoint,
}: FavoritePlacesBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState<FavoriteCategory>('all');
  const filteredPlaces = useMemo(
    () => places.filter((place) => matchesCategory(place, activeCategory)),
    [activeCategory, places],
  );
  const contentFadeStart = mediumTranslateY
    + ((collapsedTranslateY - mediumTranslateY) * 0.42);
  const contentOpacity = sheetTranslateY.interpolate({
    extrapolate: 'clamp',
    inputRange: [mediumTranslateY, contentFadeStart, collapsedTranslateY],
    outputRange: [1, 0.78, 0],
  });
  const chromeGapRange = [0, Math.max(mediumTranslateY, 1)];
  const chromeGap = sheetChromeBottom.interpolate({
    extrapolate: 'clamp',
    inputRange: chromeGapRange,
    outputRange: [0, SHEET_RESTING_GAP],
  });
  const chromeBottomInset = Animated.add(sheetChromeBottom, chromeGap);
  const chromeBottomRadius = sheetChromeBottom.interpolate({
    extrapolate: 'clamp',
    inputRange: chromeGapRange,
    outputRange: [0, SHEET_BOTTOM_RADIUS],
  });

  return (
    <AnimatedViewBottomSheet style={[ { height, transform: [{ translateY: sheetTranslateY }] }]}>
      <AnimatedViewSheetChromeShadow
        pointerEvents="none"
        style={[ { bottom: chromeBottomInset, left: chromeGap, right: chromeGap }]}
     >
        <AnimatedViewSheetChrome
          style={[

            { borderBottomLeftRadius: chromeBottomRadius, borderBottomRightRadius: chromeBottomRadius },
          ]}
       >
          <GlassSurfaceAbsoluteFill
            glassEffectStyle="regular"
            intensity={100}

            tintColor="rgba(248,248,248,0.28)"
          />
          <ViewSheetTint  />
        </AnimatedViewSheetChrome>
      </AnimatedViewSheetChromeShadow>

      <ViewSheetInner>
        <ViewHandleArea  {...panHandlers}>
          <PressableHandleButton
            accessibilityLabel="즐겨찾기 패널 크기 조절"
            accessibilityRole="adjustable"
            onPress={onHandlePress}

         >
            <ViewHandle  />
          </PressableHandleButton>
        </ViewHandleArea>
        <AnimatedViewContent
          pointerEvents={snapPoint === 'collapsed' ? 'none' : 'auto'}
          style={[ { opacity: contentOpacity }]}
       >
          <ViewTitleRow>
            <HeaderStar />
            <TextTitle>내 장소</TextTitle>
          </ViewTitleRow>
          <ScrollViewCategoryScroll
            contentContainerStyle={styles.categoryContent}
            horizontal
            showsHorizontalScrollIndicator={false}

         >
            {categories.map(({ Icon, id, label }) => {
              const active = activeCategory === id;
              return (
                <PressableCategoryChip
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  key={`${id}-${label}`}
                  onPress={() => setActiveCategory(id)}
                  style={[ active && styles.categoryChipActive]}
               >
                  {Icon ? <Icon color={active ? '#FF245B' : '#616169'} height={17} width={20} /> : null}
                  <TextCategoryLabel style={[ active && styles.categoryLabelActive]}>{label}</TextCategoryLabel>
                </PressableCategoryChip>
              );
            })}
          </ScrollViewCategoryScroll>

          <ViewListViewport
            style={[

              snapPoint === 'medium' && styles.listViewportMedium,
            ]}
         >
            <ScrollViewList
              contentContainerStyle={styles.listContent}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}

           >
              {filteredPlaces.length> 0 ? filteredPlaces.map((place) => (
                <FavoritePlaceRow
                  imageUrls={imageUrlsByPlaceId[String(place.id)] ?? []}
                  key={place.id}
                  onPress={() => onPlacePress(place)}
                  onRemove={() => onRemovePlace(place)}
                  pending={Boolean(pendingPlaceIds[String(place.id)])}
                  place={place}
                />
              )) : isLoading ? (
                <ViewEmptyState>
                  <TextEmptyTitle>저장한 장소를 불러오는 중이에요</TextEmptyTitle>
                </ViewEmptyState>
              ) : isUnauthorized ? (
                <ViewEmptyState>
                  <TextEmptyTitle>로그인이 만료됐어요</TextEmptyTitle>
                  <TextEmptyBody>다시 로그인한 뒤 저장한 장소를 확인해 주세요.</TextEmptyBody>
                </ViewEmptyState>
              ) : isError ? (
                <ViewEmptyState>
                  <TextEmptyTitle>장소를 불러오지 못했어요</TextEmptyTitle>
                  <PressableRetryButton accessibilityRole="button" onPress={onRetry}>
                    <TextRetryLabel>다시 시도</TextRetryLabel>
                  </PressableRetryButton>
                </ViewEmptyState>
              ) : (
                <ViewEmptyState>
                  <HeaderStar />
                  <TextEmptyTitle>저장한 장소가 없어요</TextEmptyTitle>
                  <TextEmptyBody>마음에 드는 장소의 별을 눌러 모아보세요.</TextEmptyBody>
                </ViewEmptyState>
              )}
              {filteredPlaces.length> 0 && hasNextPage ? (
                <ViewLoadMoreState>
                  {isFetchNextPageError ? (
                    <TextLoadMoreError>다음 장소를 불러오지 못했어요</TextLoadMoreError>
                  ) : null}
                  <PressableLoadMoreButton
                    accessibilityLabel="저장한 장소 더 불러오기"
                    accessibilityRole="button"
                    accessibilityState={{ busy: isFetchingNextPage, disabled: isFetchingNextPage }}
                    disabled={isFetchingNextPage}
                    onPress={onLoadMore}

                 >
                    <TextRetryLabel>
                      {isFetchingNextPage ? '불러오는 중…' : isFetchNextPageError ? '다시 시도' : '더 보기'}
                    </TextRetryLabel>
                  </PressableLoadMoreButton>
                </ViewLoadMoreState>
              ) : null}
            </ScrollViewList>
          </ViewListViewport>
        </AnimatedViewContent>
      </ViewSheetInner>

      <BottomNavigation
        bottomInset={insets.bottom}
        onOpenMap={onOpenMap}
        onOpenRecommendations={onOpenRecommendations}
        onOpenReservations={onOpenReservations}
        sheetTranslateY={sheetTranslateY}
      />
    </AnimatedViewBottomSheet>
  );
}

// 보존된 미연결 시안: 네이티브 스타일 속성으로 기존 수치와 동적 애니메이션을 유지합니다.
const styles = {
  absoluteFill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  bottomSheet: { bottom: 0, left: 0, overflow: 'visible', position: 'absolute', right: 0, zIndex: 50 },
  categoryChip: {
    alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.72)', borderColor: 'rgba(255,255,255,0.92)',
    borderRadius: 17, borderWidth: 1, flexDirection: 'row', gap: 5, height: 34, justifyContent: 'center', paddingHorizontal: 12,
  },
  categoryChipActive: { backgroundColor: 'rgba(255,255,255,0.84)', borderColor: '#FF245B' },
  categoryContent: { gap: 7, paddingBottom: 10, paddingHorizontal: 0, paddingTop: 9 },
  categoryLabel: { color: '#616169', fontSize: 13, fontWeight: '700' },
  categoryLabelActive: { color: '#FF245B' },
  categoryScroll: { flexGrow: 0, height: 53, overflow: 'hidden' },
  content: { flex: 1 },
  emptyBody: { color: '#777982', fontSize: 13, marginTop: 5 },
  emptyState: { alignItems: 'center', paddingTop: 42 },
  emptyTitle: { color: '#27292F', fontSize: 17, fontWeight: '800', marginTop: 12 },
  handle: { backgroundColor: 'rgba(80,83,91,0.31)', borderRadius: 3, height: 5, width: 55 },
  handleArea: { alignItems: 'center', height: 23, justifyContent: 'center' },
  handleButton: { alignItems: 'center', height: 44, justifyContent: 'center', width: 80 },
  imagePlaceholder: { alignItems: 'center', backgroundColor: '#E7E7EA', justifyContent: 'center' },
  imageRow: { borderRadius: 15, flexDirection: 'row', height: 120, overflow: 'hidden' },
  list: { flex: 1 },
  listContent: { paddingBottom: 116, paddingHorizontal: 6 },
  listViewport: { flex: 1, marginBottom: 92, overflow: 'hidden' },
  listViewportMedium: { flex: 0, height: 182, marginBottom: 0 },
  loadMoreButton: { alignItems: 'center', alignSelf: 'center', backgroundColor: '#FF1956', borderRadius: 18, marginBottom: 18, paddingHorizontal: 20, paddingVertical: 9 },
  loadMoreError: { color: '#777982', fontSize: 13 },
  loadMoreState: { alignItems: 'center', gap: 8 },
  moreButton: { alignItems: 'center', height: 30, justifyContent: 'center', width: 24 },
  moreButtonText: { color: '#3B3B40', fontSize: 22, lineHeight: 24 },
  nameRow: { alignItems: 'baseline', flexDirection: 'row', gap: 5 },
  navItem: { alignItems: 'center', borderRadius: 27, flex: 1, gap: 3, height: 54, justifyContent: 'center', width: 80 },
  navItemActive: { backgroundColor: 'rgba(255,255,255,0.58)', borderColor: 'rgba(255,255,255,0.78)', borderWidth: 1 },
  navLabel: { color: '#3B3B40', fontSize: 11, fontWeight: '600' },
  navLabelActive: { color: '#FF245B', fontWeight: '700' },
  navigationBar: { backgroundColor: 'rgba(238,238,242,0.34)', borderColor: 'rgba(255,255,255,0.68)', borderRadius: 32, borderWidth: 1, flex: 1, flexDirection: 'row', height: 64, overflow: 'hidden', padding: 5 },
  navigationBarSolid: { backgroundColor: '#EFEFF2', borderColor: '#EFEFF2' },
  navigationRow: { flexDirection: 'row', gap: 12, left: 6, position: 'absolute', right: 16 },
  navigationShadow: { backgroundColor: 'rgba(238,238,242,0.12)', borderRadius: 32, elevation: 2, flex: 1, shadowColor: '#11151B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10 },
  placeCategory: { color: '#64666E', fontSize: 12 },
  placeHeading: { alignItems: 'center', flexDirection: 'row', marginBottom: 9 },
  placeImage: { borderRightColor: 'rgba(255,255,255,0.9)', borderRightWidth: 1, flex: 1, height: '100%' },
  placeMeta: { color: '#696B73', fontSize: 13, marginTop: 3 },
  placeName: { color: '#282A30', flexShrink: 1, fontSize: 16, fontWeight: '800' },
  placeRow: { marginBottom: 14 },
  placeText: { flex: 1 },
  pressed: { opacity: 0.72 },
  retryButton: { backgroundColor: '#FF1956', borderRadius: 18, marginTop: 14, paddingHorizontal: 18, paddingVertical: 9 },
  retryLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  sendButton: { alignItems: 'center', backgroundColor: 'rgba(238,238,242,0.12)', borderRadius: 32, elevation: 4, height: 64, justifyContent: 'center', shadowColor: '#11151B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 12, width: 64 },
  sendButtonGlass: { alignItems: 'center', backgroundColor: 'rgba(238,238,242,0.34)', borderColor: 'rgba(255,255,255,0.68)', borderRadius: 32, borderWidth: 1, height: 64, justifyContent: 'center', overflow: 'hidden', width: 64 },
  sendButtonSolid: { backgroundColor: '#EFEFF2', borderColor: '#EFEFF2' },
  sheetChrome: { backgroundColor: 'rgba(248,248,248,0.68)', borderColor: 'rgba(255,255,255,0.88)', borderRadius: 36, borderBottomLeftRadius: 48, borderBottomRightRadius: 48, borderWidth: 1, flex: 1, overflow: 'hidden' },
  sheetChromeShadow: { backgroundColor: 'rgba(244,246,248,0.08)', borderRadius: 36, elevation: 22, left: 0, position: 'absolute', right: 0, shadowColor: '#10141A', shadowOffset: { width: 0, height: -7 }, shadowOpacity: 0.17, shadowRadius: 24, top: 0 },
  sheetInner: { flex: 1, overflow: 'hidden', paddingHorizontal: SHEET_RESTING_GAP },
  sheetTint: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(250,250,251,0.92)' },
  title: { color: '#111217', fontSize: 22, fontWeight: '900', letterSpacing: -0.6 },
  titleRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
} as const;

function mergePressableStyle(base: ViewStyle, style: PressableProps['style']) {
  return typeof style === 'function' ? (state: PressableStateCallbackType) => [base, style(state)] : [base, style];
}

const ViewPlaceImage = styled(View).attrs(props => ({ style: [styles.placeImage, props.style] }))``;
const ImagePlaceImage = styled(Image).attrs(props => ({ style: [styles.placeImage, props.style] }))``;
const ViewPlaceHeading = styled(View).attrs(props => ({ style: [styles.placeHeading, props.style] }))``;
const ViewPlaceText = styled(View).attrs(props => ({ style: [styles.placeText, props.style] }))``;
const ViewNameRow = styled(View).attrs(props => ({ style: [styles.nameRow, props.style] }))``;
const TextPlaceName = styled(Text).attrs(props => ({ style: [styles.placeName, props.style] }))``;
const TextPlaceCategory = styled(Text).attrs(props => ({ style: [styles.placeCategory, props.style] }))``;
const TextPlaceMeta = styled(Text).attrs(props => ({ style: [styles.placeMeta, props.style] }))``;
const PressableMoreButton = styled(Pressable).attrs(props => ({ style: mergePressableStyle(styles.moreButton, props.style) }))``;
const TextMoreButtonText = styled(Text).attrs(props => ({ style: [styles.moreButtonText, props.style] }))``;
const ViewImageRow = styled(View).attrs(props => ({ style: [styles.imageRow, props.style] }))``;
const AnimatedViewNavigationRow = styled(Animated.View).attrs(props => ({ style: [styles.navigationRow, props.style] }))``;
const ViewNavigationShadow = styled(View).attrs(props => ({ style: [styles.navigationShadow, props.style] }))``;
const GlassSurfaceNavigationBar = styled(GlassSurface).attrs(props => ({ style: [styles.navigationBar, props.style] }))``;
const PressableNavItem = styled(Pressable).attrs(props => ({ style: mergePressableStyle(styles.navItem, props.style) }))``;
const TextNavLabel = styled(Text).attrs(props => ({ style: [styles.navLabel, props.style] }))``;
const ViewNavItem = styled(View).attrs(props => ({ style: [styles.navItem, props.style] }))``;
const ViewNavigationBar = styled(View).attrs(props => ({ style: [styles.navigationBar, props.style] }))``;
const GlassSurfaceSendButtonGlass = styled(GlassSurface).attrs(props => ({ style: [styles.sendButtonGlass, props.style] }))``;
const ViewSendButtonGlass = styled(View).attrs(props => ({ style: [styles.sendButtonGlass, props.style] }))``;
const AnimatedViewBottomSheet = styled(Animated.View).attrs(props => ({ style: [styles.bottomSheet, props.style] }))``;
const AnimatedViewSheetChromeShadow = styled(Animated.View).attrs(props => ({ style: [styles.sheetChromeShadow, props.style] }))``;
const AnimatedViewSheetChrome = styled(Animated.View).attrs(props => ({ style: [styles.sheetChrome, props.style] }))``;
const GlassSurfaceAbsoluteFill = styled(GlassSurface).attrs(props => ({ style: [styles.absoluteFill, props.style] }))``;
const ViewSheetTint = styled(View).attrs(props => ({ style: [styles.sheetTint, props.style] }))``;
const ViewSheetInner = styled(View).attrs(props => ({ style: [styles.sheetInner, props.style] }))``;
const ViewHandleArea = styled(View).attrs(props => ({ style: [styles.handleArea, props.style] }))``;
const PressableHandleButton = styled(Pressable).attrs(props => ({ style: mergePressableStyle(styles.handleButton, props.style) }))``;
const ViewHandle = styled(View).attrs(props => ({ style: [styles.handle, props.style] }))``;
const AnimatedViewContent = styled(Animated.View).attrs(props => ({ style: [styles.content, props.style] }))``;
const ViewTitleRow = styled(View).attrs(props => ({ style: [styles.titleRow, props.style] }))``;
const TextTitle = styled(Text).attrs(props => ({ style: [styles.title, props.style] }))``;
const ScrollViewCategoryScroll = styled(ScrollView).attrs(props => ({ style: [styles.categoryScroll, props.style] }))``;
const PressableCategoryChip = styled(Pressable).attrs(props => ({ style: mergePressableStyle(styles.categoryChip, props.style) }))``;
const TextCategoryLabel = styled(Text).attrs(props => ({ style: [styles.categoryLabel, props.style] }))``;
const ViewListViewport = styled(View).attrs(props => ({ style: [styles.listViewport, props.style] }))``;
const ScrollViewList = styled(ScrollView).attrs(props => ({ style: [styles.list, props.style] }))``;
const ViewEmptyState = styled(View).attrs(props => ({ style: [styles.emptyState, props.style] }))``;
const TextEmptyTitle = styled(Text).attrs(props => ({ style: [styles.emptyTitle, props.style] }))``;
const TextEmptyBody = styled(Text).attrs(props => ({ style: [styles.emptyBody, props.style] }))``;
const PressableRetryButton = styled(Pressable).attrs(props => ({ style: mergePressableStyle(styles.retryButton, props.style) }))``;
const TextRetryLabel = styled(Text).attrs(props => ({ style: [styles.retryLabel, props.style] }))``;
const ViewLoadMoreState = styled(View).attrs(props => ({ style: [styles.loadMoreState, props.style] }))``;
const TextLoadMoreError = styled(Text).attrs(props => ({ style: [styles.loadMoreError, props.style] }))``;
const PressableLoadMoreButton = styled(Pressable).attrs(props => ({ style: mergePressableStyle(styles.loadMoreButton, props.style) }))``;
