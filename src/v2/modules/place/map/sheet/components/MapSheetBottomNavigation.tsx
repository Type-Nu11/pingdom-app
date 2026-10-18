import { Text as AppText } from '../../../../../shared/components/Typography';
import React, { createContext, memo, useContext, useMemo, useRef } from 'react';
import { Animated, PanResponder, Platform, Pressable, Text, View, type PlatformOSType } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';

import CheckInAsset from '../../../../../../assets/v2/icons/place/checkin_svg.svg';
import CheckInSelectedAsset from '../../../../../../assets/v2/icons/place/checkin_selected.svg';
import CommunityActiveAsset from '../../../../../../assets/v2/icons/place/community-active.svg';
import CommunityInactiveAsset from '../../../../../../assets/v2/icons/place/community-inactive.svg';
import MapNavigationIcon from './MapNavigationIcon';
import PlaceRecommendAsset from '../../../../../../assets/v2/icons/place/placerecommend.svg';
import PlaceRecommendSelectedAsset from '../../../../../../assets/v2/icons/place/placerecommend_selected.svg';
import { FavoriteIcon } from '../../../../../shared/components';
import { lightLiquidGlass, type AppTheme } from '../../../../../shared/theme';
import FrostedSurface from '../../presentation/components/FrostedSurface';
import { MapTutorialTarget, useMapTutorial } from '../../tutorial/context';

// App-owned navigation stays mounted while the section sheets change.
const NavigationHiddenContext = createContext(false);
export const MapSheetNavigationHiddenProvider = NavigationHiddenContext.Provider;

const NAVIGATION_SIDE_INSET = 24;
// Figma Footer (7813:7003): 75px tabs overlap by 10px, so their centres sit 65px apart.
const NAVIGATION_TAB_OVERLAP = 10;

export type MapSheetNavigationTab = 'community' | 'favorites' | 'map' | 'recommendations' | 'reservations';

export const getMapSheetTabSurfaceColor = (
  active: boolean,
  liquidGlass: AppTheme['liquidGlass'] = lightLiquidGlass,
) => {
  return active ? liquidGlass.navigation.selectedTint : 'transparent';
};

// Place the Figma spacing above the system safe area so neither Android's
// navigation buttons nor the iOS home indicator overlap the app's controls.
export const getMapSheetNavigationBottom = (bottomInset: number, platform: PlatformOSType = Platform.OS) => (
  Math.max(16, bottomInset + (platform === 'ios' ? 16 : 10))
);

// The collapsed sheet's entire handle must stay above the fixed navigation bar.
export const getMapSheetCollapsedVisibleHeight = (bottomInset: number, platform: PlatformOSType = Platform.OS) => (
  getMapSheetNavigationBottom(bottomInset, platform) + 64 + 20 + 8
);

type Props = {
  activeTab: MapSheetNavigationTab;
  onOpenCommunity?: () => void;
  onOpenFavorites?: () => void;
  onOpenMap?: () => void;
  onOpenRecommendations?: () => void;
  onOpenReservations?: () => void;
  sheetTranslateY: Animated.Value;
};


const MapSheetBottomNavigation = memo(function MapSheetBottomNavigation({
  activeTab,
  onOpenCommunity,
  onOpenFavorites,
  onOpenMap,
  onOpenRecommendations,
  onOpenReservations,
  sheetTranslateY,
}: Props) {
  const { t } = useTranslation();
  const { colors, liquidGlass } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, liquidGlass), [colors, liquidGlass]);
  const insets = useSafeAreaInsets();
  const { activeTarget } = useMapTutorial();
  const selectedTab = activeTarget ?? activeTab;
  const tabs = [
    { id: 'map' as const, label: t('map.navigation.map'), onPress: onOpenMap },
    { id: 'favorites' as const, label: t('map.navigation.favorites'), onPress: onOpenFavorites },
    { id: 'community' as const, label: t('map.navigation.community'), onPress: onOpenCommunity },
    { id: 'reservations' as const, label: t('map.navigation.reservations'), onPress: onOpenReservations },
  ];
  const hidden = useContext(NavigationHiddenContext);
  const bar = useRef<View>(null);
  const bounds = useRef({ left: NAVIGATION_SIDE_INSET, width: 0 });
  const dragging = useRef(false);
  const lastDragTab = useRef<MapSheetNavigationTab | null>(null);
  const navigation = useRef({ activeTab, tabs });
  navigation.current = { activeTab, tabs };
  const measureBar = () => bar.current?.measureInWindow((left, _top, width) => {
    if (width > 8) bounds.current = { left, width };
  });
  const swipe = useMemo(() => {
    const selectAt = (pageX: number) => {
      const { left, width } = bounds.current;
      if (width <= 8 || !Number.isFinite(pageX)) return;
      const current = navigation.current;
      const index = Math.max(0, Math.min(current.tabs.length - 1,
        Math.floor((pageX - left - 4) / ((width - 8) / current.tabs.length))));
      const tab = current.tabs[index];
      if (tab.id === lastDragTab.current) return;
      lastDragTab.current = tab.id;
      if (tab.id !== current.activeTab) tab.onPress?.();
    };
    const claim = (_: unknown, gesture: { dx: number; dy: number }) => (
      Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5
    );
    const finish = () => {
      dragging.current = false;
      lastDragTab.current = null;
    };
    return PanResponder.create({
      onMoveShouldSetPanResponder: claim,
      onMoveShouldSetPanResponderCapture: claim,
      onPanResponderGrant: (_, gesture) => {
        dragging.current = true;
        lastDragTab.current = navigation.current.activeTab;
        selectAt(gesture.moveX);
      },
      onPanResponderMove: (_, gesture) => selectAt(gesture.moveX),
      onPanResponderRelease: finish,
      onPanResponderTerminate: finish,
      onPanResponderTerminationRequest: () => false,
    });
  }, []);

  if (hidden) return null;

  return (
    <Animated.View
      style={[
        styles.navigationRow,
        {
          bottom: getMapSheetNavigationBottom(insets.bottom),
          transform: [{ translateY: Animated.multiply(sheetTranslateY, -1) }],
        },
      ]}
    >
      <View {...swipe.panHandlers} ref={bar} onLayout={event => { bounds.current.width = event.nativeEvent.layout.width; measureBar(); }} collapsable={false} style={styles.navigationShadow} testID="map-navigation-swipe">
        <View style={styles.navigationBar} testID="map-navigation-bar">
        <FrostedSurface
          bottomShade={false}
          cornerRadius={32}
          glassEffectStyle="regular"
          highlightOpacity={liquidGlass.navigation.highlightOpacity}
          rimColor={liquidGlass.navigation.rim}
          pointerEvents="none"
          style={styles.navigationGlass}
          testID="map-navigation-glass"
          tintColor={liquidGlass.navigation.tint}
        />
          {tabs.map(({ id, label, onPress }, index) => {
            const active = selectedTab === id;
            // Figma icons render 1:1 inside a 28px box: map 18×20.4, star 25×24, chat and house 28.
            const icon = id === 'map'
              ? <MapNavigationIcon selected={active} color={active ? colors.primary : colors.labelNeutral} size={21} />
              : id === 'favorites'
                ? <FavoriteIcon idleColor={colors.labelNeutral} selected={active} size={24} />
                : id === 'community'
                  ? active
                    ? <CommunityActiveAsset height={28} width={28} />
                    : <CommunityInactiveAsset color={colors.labelNeutral} height={28} width={28} />
                  : active
                    ? <CheckInSelectedAsset color={colors.primary} height={28} testID="map-navigation-reservations-selected-icon" width={28} />
                    : <CheckInAsset color={colors.labelNeutral} height={22} width={21} />;

            return (
              <MapTutorialTarget
                id={id}
                key={id}
                style={index < tabs.length - 1 ? styles.navTabOverlap : styles.navTab}
                testID={`map-navigation-${id}-tab`}
              >
              <Pressable
                accessibilityLabel={label}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                key={id}
                onPress={() => { if (!dragging.current) onPress?.(); }}
                style={styles.navItem}
                testID={`map-navigation-${id}`}
              >
                <View
                  style={[
                    styles.navItemSurface,
                    {
                      backgroundColor: getMapSheetTabSurfaceColor(active, liquidGlass),
                      borderColor: active ? colors.glassStroke : 'transparent',
                    },
                  ]}
                  testID={`map-navigation-${id}-surface`}
                >
                  <View style={styles.navIcon}>{icon}</View>
                  <AppText adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1} style={[styles.navLabel, active && styles.navLabelActive]}>{label}</AppText>
                </View>
              </Pressable>
              </MapTutorialTarget>
            );
          })}
        </View>
      </View>
      <MapTutorialTarget id="recommendations">
      <Pressable
        accessibilityLabel={t('map.navigation.recommendations')}
        accessibilityRole="tab"
        accessibilityState={{ selected: selectedTab === 'recommendations' }}
        onPress={onOpenRecommendations}
        style={styles.sendButton}
        testID="map-navigation-recommendations"
      >
          <FrostedSurface
            bottomShade={false}
            cornerRadius={32}
            glassEffectStyle="regular"
            highlightOpacity={liquidGlass.navigation.highlightOpacity}
            pointerEvents="none"
            rimColor={liquidGlass.navigation.rim}
            style={styles.sendButtonGlass}
            testID="map-navigation-recommendations-surface"
            tintColor={liquidGlass.navigation.tint}
          >
            {selectedTab === 'recommendations' ? (
              <>
                <View pointerEvents="none" style={styles.sendButtonSelected} testID="map-navigation-recommendations-selected" />
                <PlaceRecommendSelectedAsset
                  color={colors.primary}
                  height={24}
                  testID="map-navigation-recommendations-selected-icon"
                  width={24}
                />
              </>
            ) : (
              <PlaceRecommendAsset color={colors.labelNeutral} height={24} width={24} />
            )}
          </FrostedSurface>
      </Pressable>
      </MapTutorialTarget>
    </Animated.View>
  );
});

export default MapSheetBottomNavigation;

const createStyles = (
  colors: AppTheme['colors'],
  liquidGlass: AppTheme['liquidGlass'],
): Record<string, object> => ({
  navIcon: { alignItems: 'center', height: 28, justifyContent: 'center', width: 28 },
  navItem: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  // The 1px border is always reserved so the dark Glass/Stroke does not shift the 7px icon inset.
  // Figma places tab content about 1px right of centre (icons at x=25–29.5 in a 75px tab).
  navItemSurface: { alignItems: 'center', borderRadius: 28, borderWidth: 1, height: 56, paddingLeft: 2, paddingTop: 6, width: '100%', maxWidth: 78 },
  navLabel: { color: colors.labelNeutral, fontSize: 10, fontWeight: '500', lineHeight: 13 },
  navTab: { flex: 1 },
  navTabOverlap: { flex: 1, marginRight: -NAVIGATION_TAB_OVERLAP },
  navLabelActive: { color: colors.primary, fontWeight: '700' },
  navigationBar: { borderRadius: 32, flex: 1, flexDirection: 'row', height: 64, overflow: 'hidden', padding: 4 },
  navigationGlass: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderRadius: 32, overflow: 'hidden' },
  navigationRow: { flexDirection: 'row', gap: 12, left: NAVIGATION_SIDE_INSET, position: 'absolute', right: NAVIGATION_SIDE_INSET },
  navigationShadow: {
    backgroundColor: liquidGlass.shadowFill,
    borderRadius: 32,
    boxShadow: liquidGlass.navigation.shadow,
    flex: 1,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: liquidGlass.shadowFill,
    borderRadius: 32,
    boxShadow: liquidGlass.navigation.shadow,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  sendButtonGlass: { alignItems: 'center', borderRadius: 32, height: 64, justifyContent: 'center', overflow: 'hidden', width: 64 },
  sendButtonSelected: {
    backgroundColor: liquidGlass.navigation.selectedTint,
    borderColor: colors.glassStroke,
    borderRadius: 28,
    borderWidth: 1,
    height: 56,
    left: 4,
    position: 'absolute',
    top: 4,
    width: 56,
  },
});
