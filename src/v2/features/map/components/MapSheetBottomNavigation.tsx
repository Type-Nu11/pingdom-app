import React, { memo, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import CheckInAsset from '../../../../assets/v2/icons/place/checkin_svg.svg';
import MapAsset from '../../../../assets/v2/icons/place/maping_svg.svg';
import PlaceRecommendAsset from '../../../../assets/v2/icons/place/placerecommend.svg';
import { FavoriteIcon } from '../../../shared/components';
import { colors } from '../../../shared/theme/colors';
import FrostedSurface from './FrostedSurface';

export type MapSheetNavigationTab = 'favorites' | 'map' | 'recommendations' | 'reservations';

export const getMapSheetTabSurfaceColor = (active: boolean, pressed: boolean) => {
  if (pressed) return colors.surfacePressed;
  return active ? colors.selectedTabSurface : 'transparent';
};

export const getMapSheetNavigationBottom = (bottomInset: number) => Math.max(24, bottomInset + 10);

type Props = {
  activeTab: MapSheetNavigationTab;
  onOpenFavorites?: () => void;
  onOpenMap?: () => void;
  onOpenRecommendations?: () => void;
  onOpenReservations?: () => void;
  sheetTranslateY: Animated.Value;
};

const ActiveReservationIcon = () => (
  <Svg height={24} viewBox="0 0 24 24" width={24}>
    <Path d="M3 10.2 12 2l9 8.2v8.3A2.5 2.5 0 0 1 18.5 21h-13A2.5 2.5 0 0 1 3 18.5Z" fill={colors.primary} />
    <Path d="m8.2 12.4 2.4 2.4 5.2-5.2" fill="none" stroke={colors.onPrimary} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
  </Svg>
);

const MapSheetBottomNavigation = memo(function MapSheetBottomNavigation({
  activeTab,
  onOpenFavorites,
  onOpenMap,
  onOpenRecommendations,
  onOpenReservations,
  sheetTranslateY,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [pressedTab, setPressedTab] = useState<MapSheetNavigationTab | null>(null);
  const tabs = [
    { id: 'map' as const, label: t('map.navigation.map'), onPress: onOpenMap },
    { id: 'favorites' as const, label: t('map.navigation.favorites'), onPress: onOpenFavorites },
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
          cornerRadius={32}
          glassEffectStyle="regular"
          highlightOpacity={0}
          rimColor="rgba(0,0,0,0.06)"
          style={styles.navigationBar}
          tintColor={colors.surface}
        >
          {tabs.map(({ id, label, onPress }) => {
            const active = activeTab === id;
            const icon = id === 'map'
              ? <MapAsset color={active ? colors.primary : colors.text} height={24} width={21} />
              : id === 'favorites'
                ? <FavoriteIcon selected={active} size={24} />
                : active
                  ? <ActiveReservationIcon />
                  : <CheckInAsset height={24} width={23} />;

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
                    { backgroundColor: getMapSheetTabSurfaceColor(active, pressedTab === id) },
                  ]}
                  testID={`map-navigation-${id}-surface`}
                >
                  <View style={styles.navIcon}>{icon}</View>
                  <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
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
            cornerRadius={32}
            glassEffectStyle="regular"
            highlightOpacity={0}
            pointerEvents="none"
            rimColor="rgba(0,0,0,0.06)"
            style={[styles.sendButtonGlass, pressedTab === 'recommendations' && styles.sendButtonPressed]}
            testID="map-navigation-recommendations-surface"
            tintColor={activeTab === 'recommendations' ? colors.border : colors.surface}
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

const styles: Record<string, object> = {
  navIcon: { alignItems: 'center', height: 28, justifyContent: 'center', width: 28 },
  navItem: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  navItemSurface: { alignItems: 'center', borderRadius: 28, gap: 2, height: 56, justifyContent: 'center', width: 78 },
  navLabel: { color: colors.text, fontSize: 10, fontWeight: '600', letterSpacing: -0.2, lineHeight: 13 },
  navLabelActive: { color: colors.primary, fontWeight: '700' },
  navigationBar: { borderRadius: 32, flex: 1, flexDirection: 'row', height: 64, overflow: 'hidden', padding: 4 },
  navigationRow: { flexDirection: 'row', gap: 12, left: 24, position: 'absolute', right: 24 },
  navigationShadow: { backgroundColor: colors.surface, borderRadius: 32, flex: 1 },
  sendButton: { alignItems: 'center', borderRadius: 32, height: 64, justifyContent: 'center', width: 64 },
  sendButtonGlass: { alignItems: 'center', borderRadius: 32, height: 64, justifyContent: 'center', overflow: 'hidden', width: 64 },
  sendButtonPressed: { backgroundColor: colors.surfacePressed },
};
