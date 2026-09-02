import React from 'react';
import { ActivityIndicator, Animated, PanResponder } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchAsset from '../../../../assets/v2/icons/search.svg';
import ArtIcon from '../../../../assets/v2/icons/place/art_svg.svg';
import BeautyIcon from '../../../../assets/v2/icons/place/beati_svg.svg';
import CafeIcon from '../../../../assets/v2/icons/place/cafe_svg.svg';
import EtcIcon from '../../../../assets/v2/icons/place/etc_svg.svg';
import FashionIcon from '../../../../assets/v2/icons/place/fashion_svg.svg';
import FoodIcon from '../../../../assets/v2/icons/place/food_svg.svg';
import HeritageIcon from '../../../../assets/v2/icons/place/heritage.svg';
import MusicIcon from '../../../../assets/v2/icons/place/music_svg.svg';
import FinderIcon from '../../../../assets/v2/icons/finder.svg';
import PopupIcon from '../../../../assets/v2/icons/place/popup_svg.svg';
import AvatarPlaceholder from '../../../shared/assets/icons/avatar-placeholder.svg';
import {
  getMapPullIndicatorDistance,
  isDownwardMapPull,
  shouldRefreshMapFromPullGesture,
} from '../utils/mapRefreshGesture';
import * as S from '../styles/MapTopOverlay.styles';

export type MapCategoryId =
  | 'all'
  | 'art'
  | 'beauty'
  | 'cafe'
  | 'etc'
  | 'fashion'
  | 'food'
  | 'heritage'
  | 'music'
  | 'popup';

type MapTopOverlayProps = {
  activeCategory: MapCategoryId;
  onCategoryChange: (category: MapCategoryId) => void;
  onLocatePress?: () => void;
  onProfilePress?: () => void;
  onQueryChange: (query: string) => void;
  onRefreshMap?: () => Promise<void> | void;
  onSearchFocus: () => void;
  onSubmitSearch: () => void;
  profileImageUrl?: string | null;
  query: string;
  showCategories?: boolean;
};

const categories: Array<{
  Icon?: React.ComponentType<{ color?: string; height: number; width: number }>;
  id: MapCategoryId;
}> = [
  { id: 'all' }, { Icon: FoodIcon, id: 'food' }, { Icon: MusicIcon, id: 'music' },
  { Icon: PopupIcon, id: 'popup' }, { Icon: FashionIcon, id: 'fashion' },
  { Icon: BeautyIcon, id: 'beauty' }, { Icon: ArtIcon, id: 'art' },
  { Icon: CafeIcon, id: 'cafe' }, { Icon: HeritageIcon, id: 'heritage' }, { Icon: EtcIcon, id: 'etc' },
];

export default function MapTopOverlay({
  activeCategory,
  onCategoryChange,
  onLocatePress,
  onProfilePress,
  onRefreshMap,
  onSearchFocus,
  profileImageUrl,
  query,
  showCategories = true,
}: MapTopOverlayProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const pullDistance = React.useRef(new Animated.Value(0)).current;
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const resetPullIndicator = React.useCallback(() => {
    Animated.spring(pullDistance, {
      damping: 18,
      mass: 0.7,
      stiffness: 180,
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, [pullDistance]);
  const finishPull = React.useCallback(async (gesture: {
    dx: number;
    dy: number;
  }) => {
    if (!onRefreshMap || !shouldRefreshMapFromPullGesture(gesture)) {
      resetPullIndicator();
      return;
    }

    setIsRefreshing(true);
    Animated.spring(pullDistance, {
      damping: 18,
      stiffness: 180,
      toValue: 44,
      useNativeDriver: true,
    }).start();

    try {
      await onRefreshMap();
    } finally {
      setIsRefreshing(false);
      resetPullIndicator();
    }
  }, [onRefreshMap, pullDistance, resetPullIndicator]);
  const refreshPanResponder = React.useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => (
      Boolean(onRefreshMap) && !isRefreshing && isDownwardMapPull(gesture)
    ),
    onPanResponderMove: (_, gesture) => {
      pullDistance.setValue(getMapPullIndicatorDistance(gesture.dy));
    },
    onPanResponderRelease: (_, gesture) => {
      void finishPull(gesture);
    },
    onPanResponderTerminate: resetPullIndicator,
  }), [finishPull, isRefreshing, onRefreshMap, pullDistance, resetPullIndicator]);
  const indicatorOpacity = pullDistance.interpolate({
    inputRange: [0, 18],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const indicatorTranslateY = pullDistance.interpolate({
    inputRange: [0, 44],
    outputRange: [-38, 8],
    extrapolate: 'clamp',
  });

  return (
    <S.SafeOverlay edges={['top']} pointerEvents="box-none">
      <S.RefreshIndicatorContainer
        pointerEvents="none"
        style={{
          opacity: indicatorOpacity,
          top: insets.top
            + S.MAP_TOP_OVERLAY_METRICS.headerHeight
            + (showCategories ? S.MAP_TOP_OVERLAY_METRICS.categoryHeight + 24 : 16),
          transform: [{ translateY: indicatorTranslateY }],
        }}
        testID="map-pull-to-refresh-indicator"
      >
        <ActivityIndicator
          accessibilityLabel={t('map.refreshing')}
          animating
          color="#FF245B"
          size="small"
        />
      </S.RefreshIndicatorContainer>
      <S.PullGestureArea
        {...refreshPanResponder.panHandlers}
        testID="map-pull-to-refresh"
      >
      <S.Header>
        <S.HeaderShadow>
          <S.HeaderSurface>
            <S.HeaderGlass
              bottomShade={false}
              cornerRadius={31}
              glassEffectStyle="regular"
              highlightOpacity={0.16}
              intensity={32}
              pointerEvents="none"
              rimColor="transparent"
              tintColor="rgba(255,255,255,0.76)"
            />
            <S.SearchShadow>
              <S.SearchGlass
                bottomShade={false}
                cornerRadius={24}
                glassEffectStyle="regular"
                highlightOpacity={0.20}
                pointerEvents="none"
                rimColor="transparent"
                tintColor="rgba(242,242,245,0.86)"
              />
              <S.SearchContent
                accessibilityLabel={t('map.search.accessibilityLabel')}
                accessibilityRole="button"
                onPress={onSearchFocus}
              >
                <SearchAsset
                  height={S.MAP_TOP_OVERLAY_METRICS.searchIconSize}
                  width={S.MAP_TOP_OVERLAY_METRICS.searchIconSize}
                />
                <S.SearchInput
                  $isPlaceholder={!query}
                  numberOfLines={1}
                >
                  {query || t('map.searchOverlay.placeholder')}
                </S.SearchInput>
              </S.SearchContent>
            </S.SearchShadow>
            <S.ProfileButton
              accessibilityLabel={t('map.search.profileAccessibilityLabel')}
              accessibilityRole="button"
              hitSlop={4}
              onPress={onProfilePress}
              style={({ pressed }) => pressed ? { opacity: 0.72, transform: [{ scale: 0.98 }] } : undefined}
            >
              {profileImageUrl ? (
                <S.ProfileImage
                  source={{ uri: profileImageUrl }}
                  testID="v2-map-profile-image"
                />
              ) : (
                <AvatarPlaceholder
                  height={S.MAP_TOP_OVERLAY_METRICS.profileIconSize}
                  width={S.MAP_TOP_OVERLAY_METRICS.profileIconSize}
                />
              )}
            </S.ProfileButton>
          </S.HeaderSurface>
        </S.HeaderShadow>
      </S.Header>

      {showCategories ? (
        <>
          <S.CategoryScroll
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <S.CategoryContent>
              {categories.map(({ Icon, id }, index) => {
                const isActive = activeCategory === id;
                const label = t(`map.categories.${id}`);

                return (
                  <S.CategoryChipButton
                    $active={isActive}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    key={`${id}-${index}`}
                    onPress={() => onCategoryChange(id)}
                    style={({ pressed }) => pressed ? { opacity: 0.72, transform: [{ scale: 0.98 }] } : undefined}
                  >
                    <S.CategoryChipClip>
                      <S.CategoryChipGlass
                        bottomShade={false}
                        cornerRadius={19}
                        glassEffectStyle="regular"
                        highlightOpacity={isActive ? 0.18 : 0.14}
                        pointerEvents="none"
                        rimColor="transparent"
                        tintColor={isActive ? 'rgba(255,201,211,0.24)' : 'rgba(255,255,255,0.95)'}
                      />
                      <S.CategoryChipContent>
                        {Icon ? (
                          <Icon
                            color={isActive ? '#FF245B' : '#5E5E66'}
                            height={S.MAP_TOP_OVERLAY_METRICS.categoryIconHeight}
                            width={S.MAP_TOP_OVERLAY_METRICS.categoryIconWidth}
                          />
                        ) : null}
                        <S.CategoryLabel $active={isActive}>{label}</S.CategoryLabel>
                      </S.CategoryChipContent>
                    </S.CategoryChipClip>
                  </S.CategoryChipButton>
                );
              })}
            </S.CategoryContent>
          </S.CategoryScroll>
          {onLocatePress ? (
            <S.LocateButtonRow pointerEvents="box-none">
              <S.LocateButton
                accessibilityLabel={t('map.locate')}
                accessibilityRole="button"
                onPress={onLocatePress}
                style={({ pressed }) => pressed ? { opacity: 0.72, transform: [{ scale: 0.96 }] } : undefined}
                testID="map-locate-button"
              >
                <FinderIcon height={20} testID="map-locate-icon" width={20} />
              </S.LocateButton>
            </S.LocateButtonRow>
          ) : null}
        </>
      ) : null}
      </S.PullGestureArea>
    </S.SafeOverlay>
  );
}
