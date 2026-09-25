import React from 'react';
import { ActivityIndicator, Animated, PanResponder, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchAsset from '../../../../../../assets/v2/icons/search.svg';
import ArtIcon from '../../../../../../assets/v2/icons/place/art_svg.svg';
import BeautyIcon from '../../../../../../assets/v2/icons/place/beati_svg.svg';
import CafeIcon from '../../../../../../assets/v2/icons/place/cafe_svg.svg';
import EtcIcon from '../../../../../../assets/v2/icons/place/etc_svg.svg';
import FashionIcon from '../../../../../../assets/v2/icons/place/fashion_svg.svg';
import FoodIcon from '../../../../../../assets/v2/icons/place/food_svg.svg';
import HeritageIcon from '../../../../../../assets/v2/icons/place/heritage.svg';
import MusicIcon from '../../../../../../assets/v2/icons/place/music_svg.svg';
import FinderIcon from '../../../../../../assets/v2/icons/finder.svg';
import PopupIcon from '../../../../../../assets/v2/icons/place/popup_svg.svg';
import AvatarPlaceholder from '../../../../../shared/assets/icons/avatar-placeholder.svg';
import { useTheme } from 'styled-components/native';
import {
  getMapPullIndicatorDistance,
  isDownwardMapPull,
  shouldRefreshMapFromPullGesture,
} from '../../sheet/utils/mapRefreshGesture';
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
  onAssistantPress?: () => void;
  assistantDisabled?: boolean;
  assistantSheetTop?: Animated.Value;
  assistantRestingTop?: number;
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
  iconSize?: { height: number; width: number; drawingHeight?: number; drawingWidth?: number };
}> = [
  { id: 'all' },
  { Icon: FoodIcon, id: 'food', iconSize: { width: 15, height: 18 } },
  { Icon: MusicIcon, id: 'music', iconSize: { width: 18.75, height: 15.625, drawingWidth: 20.75, drawingHeight: 17.625 } },
  { Icon: PopupIcon, id: 'popup', iconSize: { width: 18, height: 17, drawingWidth: 20, drawingHeight: 19 } },
  { Icon: FashionIcon, id: 'fashion', iconSize: { width: 24, height: 18 } },
  { Icon: BeautyIcon, id: 'beauty', iconSize: { width: 7, height: 18 } },
  { Icon: ArtIcon, id: 'art', iconSize: { width: 18, height: 18 } },
  { Icon: CafeIcon, id: 'cafe', iconSize: { width: 18.75, height: 17.709, drawingWidth: 20.75, drawingHeight: 19.709 } },
  { Icon: HeritageIcon, id: 'heritage', iconSize: { width: 21, height: 18 } },
  { Icon: EtcIcon, id: 'etc', iconSize: { width: 14, height: 2, drawingWidth: 16, drawingHeight: 4 } },
];

export default function MapTopOverlay({
  activeCategory,
  onCategoryChange,
  onLocatePress,
  onAssistantPress,
  assistantDisabled = false,
  assistantSheetTop,
  assistantRestingTop = 0,
  onProfilePress,
  onRefreshMap,
  onSearchFocus,
  profileImageUrl,
  query,
  showCategories = true,
}: MapTopOverlayProps) {
  const { t } = useTranslation();
  const { colors, liquidGlass } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  // Measure the entire overlay (including Safe Area and a reserved FAB slot).
  // Keep the slot while hidden to avoid a layout/visibility feedback loop.
  const [overlayHeight, setOverlayHeight] = React.useState(0);
  const [assistantFits, setAssistantFits] = React.useState(false);
  React.useEffect(() => {
    if (!onAssistantPress) {
      setAssistantFits(false);
      return;
    }
    const update = (top: number) => setAssistantFits(
      overlayHeight > 0 && overlayHeight + 8 <= Math.min(top, windowHeight - insets.bottom),
    );
    update(assistantRestingTop);
    const listener = assistantSheetTop?.addListener(({ value }) => update(value));
    return () => { if (listener) assistantSheetTop?.removeListener(listener); };
  }, [assistantRestingTop, assistantSheetTop, insets.bottom, onAssistantPress, overlayHeight, windowHeight]);
  const pullDistance = React.useRef(new Animated.Value(0)).current;
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isLocatePressed, setIsLocatePressed] = React.useState(false);
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
    <S.SafeOverlay
      edges={['top', 'left', 'right']}
      pointerEvents="box-none"
      testID="map-top-safe-overlay"
      onLayout={event => setOverlayHeight(event.nativeEvent.layout.height)}
    >
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
          color={colors.primary}
          size="small"
        />
      </S.RefreshIndicatorContainer>
      <S.PullGestureArea
        {...refreshPanResponder.panHandlers}
        testID="map-pull-to-refresh"
      >
      <S.Header>
        <S.HeaderShadow style={{ boxShadow: liquidGlass.header.shadow }} testID="map-header-shadow">
          <S.HeaderSurface>
            <S.HeaderGlass
              bottomShade={false}
              cornerRadius={liquidGlass.header.radius}
              glassEffectStyle="regular"
              highlightOpacity={liquidGlass.header.highlightOpacity}
              intensity={32}
              pointerEvents="none"
              rimColor={liquidGlass.header.rim}
              tintColor={liquidGlass.header.tint}
            />
            <S.SearchShadow>
              <S.SearchGlass
                bottomShade={false}
                cornerRadius={liquidGlass.search.radius}
                glassEffectStyle="regular"
                highlightOpacity={liquidGlass.search.highlightOpacity}
                pointerEvents="none"
                rimColor={liquidGlass.search.rim}
                tintColor={liquidGlass.search.tint}
              />
              <S.SearchInsetShadow
                pointerEvents="none"
                style={{ boxShadow: liquidGlass.search.shadow }}
                testID="map-search-inset-shadow"
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
              {categories.map(({ Icon, id, iconSize }) => {
                const isActive = activeCategory === id;
                const label = t(`map.categories.${id}`);

                return (
                  <S.CategoryChipButton
                    $active={isActive}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    hitSlop={{ top: 5, bottom: 5 }}
                    key={id}
                    onPress={() => onCategoryChange(id)}
                    style={({ pressed }) => ({
                      boxShadow: liquidGlass.category.shadow,
                      ...(pressed ? { opacity: 0.72, transform: [{ scale: 0.98 }] } : {}),
                    })}
                  >
                    <S.CategoryChipClip>
                      <S.CategoryChipGlass
                        androidTintColor={isActive ? liquidGlass.category.androidActiveTint : liquidGlass.category.androidTint}
                        blurTint="default"
                        glassEffectStyle="clear"
                        intensity={32}
                        pointerEvents="none"
                        tintColor={isActive ? liquidGlass.category.activeTint : liquidGlass.category.tint}
                      />
                      <S.CategoryChipContent>
                        {Icon && iconSize ? (
                          <S.CategoryIconFrame
                            style={{ height: iconSize.height, width: iconSize.width }}
                            testID={`map-category-icon-${id}`}
                          >
                            <Icon
                              color={isActive ? colors.primary : colors.textAlternative}
                              height={iconSize.drawingHeight ?? iconSize.height}
                              width={iconSize.drawingWidth ?? iconSize.width}
                            />
                          </S.CategoryIconFrame>
                        ) : null}
                        <S.CategoryLabel
                          $active={isActive}
                          style={{
                            includeFontPadding: false,
                          }}
                        >{label}</S.CategoryLabel>
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
                onPressIn={() => setIsLocatePressed(true)}
                onPressOut={() => setIsLocatePressed(false)}
                style={({ pressed }) => ({
                  boxShadow: liquidGlass.navigation.shadow,
                  ...(pressed ? { opacity: 0.72, transform: [{ scale: 0.96 }] } : {}),
                })}
                testID="map-locate-button"
              >
                <S.LocateGlass
                  bottomShade={false}
                  cornerRadius={22}
                  glassEffectStyle="regular"
                  highlightOpacity={liquidGlass.navigation.highlightOpacity}
                  pointerEvents="none"
                  rimColor={liquidGlass.navigation.rim}
                  tintColor={liquidGlass.navigation.tint}
                />
                <FinderIcon
                  color={isLocatePressed ? colors.primary : colors.text}
                  height={20}
                  testID="map-locate-icon"
                  width={20}
                />
              </S.LocateButton>
              {onAssistantPress ? (
                <View
                  testID="map-assistant-slot"
                  pointerEvents={assistantFits ? 'auto' : 'none'}
                  accessibilityElementsHidden={!assistantFits}
                  importantForAccessibility={assistantFits ? 'auto' : 'no-hide-descendants'}
                  style={{ marginTop: 8, opacity: assistantFits ? 1 : 0 }}
                >
                  <S.AssistantButton
                    testID="map-assistant-fab"
                    accessibilityRole="button"
                    accessibilityLabel={t('voiceAssistant.open')}
                    accessibilityState={{ disabled: assistantDisabled || !assistantFits, expanded: assistantDisabled }}
                    disabled={assistantDisabled || !assistantFits}
                    onPress={onAssistantPress}
                    style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
                  >
                    <S.AssistantLabel accessible={false}>{t('voiceAssistant.shortLabel')}</S.AssistantLabel>
                  </S.AssistantButton>
                </View>
              ) : null}
            </S.LocateButtonRow>
          ) : null}
        </>
      ) : null}
      </S.PullGestureArea>
    </S.SafeOverlay>
  );
}
