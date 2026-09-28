import { Text as AppText } from '../../../../../shared/components/Typography';
import React, { memo, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from 'styled-components/native';

import CheckInAsset from '../../../../../../assets/v2/icons/place/checkin_svg.svg';
import CommunityActiveAsset from '../../../../../../assets/v2/icons/place/community-active.svg';
import CommunityInactiveAsset from '../../../../../../assets/v2/icons/place/community-inactive.svg';
import MapAsset from '../../../../../../assets/v2/icons/place/maping_svg.svg';
import PlaceRecommendAsset from '../../../../../../assets/v2/icons/place/placerecommend.svg';
import { FavoriteIcon } from '../../../../../shared/components';
import { lightLiquidGlass, type AppTheme } from '../../../../../shared/theme';
import FrostedSurface from '../../presentation/components/FrostedSurface';

export type MapSheetNavigationTab = 'community' | 'favorites' | 'map' | 'recommendations' | 'reservations';

export const getMapSheetTabSurfaceColor = (
  active: boolean,
  pressed: boolean,
  liquidGlass: AppTheme['liquidGlass'] = lightLiquidGlass,
) => {
  if (pressed) return liquidGlass.navigation.pressedTint;
  return active ? liquidGlass.navigation.selectedTint : 'transparent';
};

export const getMapSheetNavigationBottom = (bottomInset: number) => Math.max(16, bottomInset + 10);

type Props = {
  activeTab: MapSheetNavigationTab;
  onOpenCommunity?: () => void;
  onOpenFavorites?: () => void;
  onOpenMap?: () => void;
  onOpenRecommendations?: () => void;
  onOpenReservations?: () => void;
  sheetTranslateY: Animated.Value;
};

const InactiveMapIcon = ({ color }: { color: string }) => (
  // Reuse maping_svg.svg's outer contour, without its filled body or center hole.
  // The padded viewBox leaves room for the outline instead of clipping its edges.
  <Svg height={24} viewBox="-1 -1 20 23" width={21}>
    <Path
      d="M9 0C11.3869 0 13.6764 0.934087 15.3643 2.59668C17.0521 4.25932 18 6.51489 18 8.86621C17.9999 11.2174 17.052 13.4722 15.3643 15.1348L9 20.4004L2.63672 15.1348C1.80101 14.3116 1.13787 13.3343 0.685547 12.2588C0.233268 11.1833 5.22794e-05 10.0304 0 8.86621C0 7.70194 0.233217 6.54829 0.685547 5.47266C1.13787 4.3972 1.80105 3.41978 2.63672 2.59668C4.32447 0.934296 6.61328 6.38185e-05 9 0Z"
      fill="none"
      stroke={color}
      strokeLinejoin="round"
      strokeWidth={1.8}
      testID="map-navigation-map-outline"
    />
  </Svg>
);

const ActiveReservationIcon = ({ colors }: { colors: AppTheme['colors'] }) => (
  <Svg height={24} viewBox="0 0 24 24" width={24}>
    <Path d="M3 10.2 12 2l9 8.2v8.3A2.5 2.5 0 0 1 18.5 21h-13A2.5 2.5 0 0 1 3 18.5Z" fill={colors.primary} />
    <Path d="m8.2 12.4 2.4 2.4 5.2-5.2" fill="none" stroke={colors.onPrimary} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
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
  const [pressedTab, setPressedTab] = useState<MapSheetNavigationTab | null>(null);
  const tabs = [
    { id: 'map' as const, label: t('map.navigation.map'), onPress: onOpenMap },
    { id: 'favorites' as const, label: t('map.navigation.favorites'), onPress: onOpenFavorites },
    { id: 'community' as const, label: t('map.navigation.community'), onPress: onOpenCommunity },
    { id: 'reservations' as const, label: t('map.navigation.reservations'), onPress: onOpenReservations },
  ];

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
      <View style={styles.navigationShadow}>
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
            const active = activeTab === id;
            const icon = id === 'map'
              ? active
                ? <MapAsset color={colors.primary} height={24} width={21} />
                : <InactiveMapIcon color={colors.text} />
              : id === 'favorites'
                ? <FavoriteIcon selected={active} size={24} />
                : id === 'community'
                  ? active
                    ? <CommunityActiveAsset height={24} width={24} />
                    : <CommunityInactiveAsset height={24} width={24} />
                  : active
                    ? <ActiveReservationIcon colors={colors} />
                    : <CheckInAsset color={colors.text} height={24} width={23} />;

            return (
              <Pressable
                accessibilityLabel={label}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                key={id}
                onPress={onPress}
                onPressIn={() => setPressedTab(id)}
                onPressOut={() => setPressedTab(null)}
                style={styles.navItem}
                testID={`map-navigation-${id}`}
              >
                <View
                  style={[
                    styles.navItemSurface,
                    { backgroundColor: getMapSheetTabSurfaceColor(active, pressedTab === id, liquidGlass) },
                  ]}
                  testID={`map-navigation-${id}-surface`}
                >
                  <View style={styles.navIcon}>{icon}</View>
                  <AppText style={[styles.navLabel, active && styles.navLabelActive]}>{label}</AppText>
                </View>
              </Pressable>
            );
          })}
        </FrostedSurface>
      </View>
      <Pressable
        accessibilityLabel={t('map.navigation.recommendations')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'recommendations' }}
        onPress={onOpenRecommendations}
        onPressIn={() => setPressedTab('recommendations')}
        onPressOut={() => setPressedTab(null)}
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
            tintColor={pressedTab === 'recommendations'
              ? liquidGlass.navigation.pressedTint
              : activeTab === 'recommendations'
                ? liquidGlass.navigation.selectedTint
                : liquidGlass.navigation.tint}
          >
            <PlaceRecommendAsset
              color={activeTab === 'recommendations' ? colors.primary : colors.text}
              height={24}
              width={24}
            />
          </FrostedSurface>
      </Pressable>
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
  navItemSurface: { alignItems: 'center', borderRadius: 28, gap: 2, height: 56, justifyContent: 'center', width: 78 },
  navLabel: { color: colors.text, fontSize: 10, fontWeight: '500', lineHeight: 13 },
  navLabelActive: { color: colors.primary, fontWeight: '700' },
  navigationBar: { borderRadius: 32, flex: 1, flexDirection: 'row', height: 64, overflow: 'hidden', padding: 4 },
  navigationRow: { flexDirection: 'row', gap: 12, left: 24, position: 'absolute', right: 24 },
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
