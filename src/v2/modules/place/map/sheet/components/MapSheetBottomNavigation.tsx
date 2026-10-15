import { Text as AppText } from '../../../../../shared/components/Typography';
import React, { createContext, memo, useContext, useMemo, useRef } from 'react';
import { Animated, PanResponder, Platform, Pressable, Text, View, type PlatformOSType } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from 'styled-components/native';

import CheckInAsset from '../../../../../../assets/v2/icons/place/checkin_svg.svg';
import CommunityActiveAsset from '../../../../../../assets/v2/icons/place/community-active.svg';
import CommunityInactiveAsset from '../../../../../../assets/v2/icons/place/community-inactive.svg';
import MapNavigationIcon from './MapNavigationIcon';
import PlaceRecommendAsset from '../../../../../../assets/v2/icons/place/placerecommend.svg';
import { FavoriteIcon } from '../../../../../shared/components';
import { lightLiquidGlass, type AppTheme } from '../../../../../shared/theme';
import FrostedSurface from '../../presentation/components/FrostedSurface';
import { MapTutorialTarget, useMapTutorial } from '../../tutorial/context';

// App-owned navigation stays mounted while the section sheets change.
const NavigationHiddenContext = createContext(false);
export const MapSheetNavigationHiddenProvider = NavigationHiddenContext.Provider;

const NAVIGATION_SIDE_INSET = 24;

export type MapSheetNavigationTab = 'community' | 'favorites' | 'map' | 'recommendations' | 'reservations';

export const getMapSheetTabSurfaceColor = (
  active: boolean,
  liquidGlass: AppTheme['liquidGlass'] = lightLiquidGlass,
) => {
  return active ? liquidGlass.navigation.selectedTint : 'transparent';
};

// Figma pins the bar 16px above the screen edge. iOS follows it and lets the bar
// sit over the home-indicator area; Android keeps clear of a visible system
// navigation bar, which would otherwise cover the tabs.
export const getMapSheetNavigationBottom = (bottomInset: number, platform: PlatformOSType = Platform.OS) => (
  platform === 'ios' ? 16 : Math.max(16, bottomInset + 10)
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


const ActiveReservationIcon = ({ colors, foreground }: { colors: AppTheme['colors']; foreground: string }) => (
  <Svg height={24} viewBox="0 0 24 24" width={24}>
    <Path d="M3 10.2 12 2l9 8.2v8.3A2.5 2.5 0 0 1 18.5 21h-13A2.5 2.5 0 0 1 3 18.5Z" fill={colors.primary} />
    <Path d="m8.2 12.4 2.4 2.4 5.2-5.2" fill="none" stroke={foreground} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" testID="map-navigation-reservation-check" />
  </Svg>
);

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
        <FrostedSurface
          bottomShade={false}
          cornerRadius={32}
          glassEffectStyle="regular"
          highlightOpacity={liquidGlass.navigation.highlightOpacity}
          rimColor={liquidGlass.navigation.rim}
          style={styles.navigationBar}
          tintColor={liquidGlass.navigation.tint}
        >
          {tabs.map(({ id, label, onPress }) => {
            const active = selectedTab === id;
            const icon = id === 'map'
              ? <MapNavigationIcon selected={active} color={active ? colors.primary : colors.text} />
              : id === 'favorites'
                ? <FavoriteIcon selected={active} size={24} />
                : id === 'community'
                  ? active
                    ? <CommunityActiveAsset height={24} width={24} />
                    : <CommunityInactiveAsset color={colors.text} height={24} width={24} />
                  : active
                    ? <ActiveReservationIcon colors={colors} foreground={liquidGlass.primaryCta.foreground} />
                    : <CheckInAsset color={colors.text} height={24} width={23} />;

            return (
              <MapTutorialTarget id={id} key={id} style={{ flex: 1 }}>
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
                    { backgroundColor: getMapSheetTabSurfaceColor(active, liquidGlass) },
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
        </FrostedSurface>
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
            tintColor={selectedTab === 'recommendations'
                ? liquidGlass.navigation.selectedTint
                : liquidGlass.navigation.tint}
          >
            <PlaceRecommendAsset
              color={selectedTab === 'recommendations' ? colors.primary : colors.text}
              height={24}
              width={24}
            />
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
  navItemSurface: { alignItems: 'center', borderRadius: 28, gap: 2, height: 56, justifyContent: 'center', width: '100%', maxWidth: 78 },
  navLabel: { color: colors.text, fontSize: 10, fontWeight: '500', lineHeight: 13 },
  navLabelActive: { color: colors.primary, fontWeight: '700' },
  navigationBar: { borderRadius: 32, flex: 1, flexDirection: 'row', height: 64, overflow: 'hidden', padding: 4 },
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
});
