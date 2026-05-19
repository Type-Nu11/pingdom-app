import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import CategoryChips from '../components/CategoryChips';
import KakaoMapCard from '../components/KakaoMapCard';
import MapActionButtons from '../components/MapActionButtons';
import MapBottomSheet from '../components/MapBottomSheet';
import MapSearchBar from '../components/MapSearchBar';
import { hotPlaceFixtures, mapCategories, mapMarkerFixtures } from '../constants/mapFixtures';
import {
  ACTION_BOTTOM_GAP,
  BASE_SCREEN_HEIGHT,
  BASE_SCREEN_WIDTH,
  BASE_SHEET_COLLAPSED_VISIBLE_HEIGHT,
  BASE_SHEET_EXPANDED_HEIGHT,
  clamp,
} from '../constants/mapLayout';
import { useBottomSheet } from '../hooks/useBottomSheet';
import { useCurrentLocation } from '../hooks/useCurrentLocation';

type MapScreenProps = {
  onCreatePlace?: () => void;
};

export default function MapScreen({ onCreatePlace }: MapScreenProps) {
  const { width, height } = useWindowDimensions();
  const { center, userLat, userLng, followUser } = useCurrentLocation();
  const uiScale = Math.min(width / BASE_SCREEN_WIDTH, height / BASE_SCREEN_HEIGHT, 1);
  const sheetExpandedHeight = Math.round(
    clamp(Math.min(BASE_SHEET_EXPANDED_HEIGHT * uiScale, height * 0.74), 420, BASE_SHEET_EXPANDED_HEIGHT)
  );
  const sheetCollapsedVisibleHeight = Math.round(
    clamp(BASE_SHEET_COLLAPSED_VISIBLE_HEIGHT * uiScale, 104, BASE_SHEET_COLLAPSED_VISIBLE_HEIGHT)
  );
  const sheetCollapsedTranslateY = Math.max(0, sheetExpandedHeight - sheetCollapsedVisibleHeight);
  const smallActionWidth = Math.round(clamp(38 * uiScale, 30, 38));
  const smallActionHeight = Math.round(clamp(44 * uiScale, 35, 44));
  const addIconSize = Math.round(clamp(21 * uiScale, 17, 21));
  const addTextSize = Math.round(clamp(17 * uiScale, 14, 17));
  const sideGap = Math.round(clamp(42 * uiScale, 16, 42));
  const rightGap = Math.round(clamp(36 * uiScale, 16, 36));
  const topPaddingX = Math.round(clamp(22 * uiScale, 16, 22));
  const topPaddingTop = Math.round(clamp(44 * uiScale, 24, 44));
  const searchHeight = Math.round(clamp(64 * uiScale, 44, 64));
  const profileSize = Math.round(clamp(44 * uiScale, 32, 44));
  const chipHeight = Math.round(clamp(46 * uiScale, 34, 46));
  const categoryIconScale = clamp(chipHeight / 46, 0.78, 1);
  const { isExpanded, panHandlers, sheetTranslateY, toggleSheet } = useBottomSheet({
    collapsedTranslateY: sheetCollapsedTranslateY,
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <KakaoMapCard
        style={styles.map}
        centerLat={center.lat}
        centerLng={center.lng}
        zoomLevel={16}
        userLat={userLat}
        userLng={userLng}
        followUser={followUser}
        markers={mapMarkerFixtures}
      />

      <View style={styles.mapTint} pointerEvents="none" />
      <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
        <View
          style={[
            styles.topPanel,
            { paddingHorizontal: topPaddingX, paddingTop: topPaddingTop },
          ]}
          pointerEvents="box-none"
        >
          <MapSearchBar profileSize={profileSize} searchHeight={searchHeight} uiScale={uiScale} />
          <CategoryChips
            categories={mapCategories}
            categoryIconScale={categoryIconScale}
            chipHeight={chipHeight}
            topPaddingX={topPaddingX}
            uiScale={uiScale}
          />
        </View>
      </SafeAreaView>

      <MapActionButtons
        addIconSize={addIconSize}
        addTextSize={addTextSize}
        bottom={sheetExpandedHeight + ACTION_BOTTOM_GAP}
        left={sideGap}
        onAddPlace={onCreatePlace}
        right={rightGap}
        sheetTranslateY={sheetTranslateY}
        smallActionHeight={smallActionHeight}
        smallActionWidth={smallActionWidth}
      />

      <MapBottomSheet
        height={sheetExpandedHeight}
        isExpanded={isExpanded}
        onToggle={toggleSheet}
        panHandlers={panHandlers}
        places={hotPlaceFixtures}
        sheetTranslateY={sheetTranslateY}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#eff3f6',
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248, 250, 252, 0.26)',
  },
  safeArea: {
    ...StyleSheet.absoluteFillObject,
  },
  topPanel: {
    paddingHorizontal: 22,
    paddingTop: 44,
  },
});
