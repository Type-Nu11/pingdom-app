import React from 'react';
import {
  Animated,
  GestureResponderHandlers,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type { RecommendedPlace } from '../model/place.types';
import HotPlaceList from './HotPlaceList';
import PlaceRail from './PlaceRail';

type MapBottomSheetProps = {
  height: number;
  isExpanded: boolean;
  isRecommendationsError?: boolean;
  isRecommendationsLoading?: boolean;
  onToggle: () => void;
  panHandlers: GestureResponderHandlers;
  places: RecommendedPlace[];
  sheetTranslateY: Animated.Value;
};

const MapBottomSheet = ({
  height,
  isExpanded,
  isRecommendationsError = false,
  isRecommendationsLoading = false,
  onToggle,
  panHandlers,
  places,
  sheetTranslateY,
}: MapBottomSheetProps) => {
  return (
    <Animated.View
      style={[
        styles.bottomSheet,
        {
          height,
          transform: [{ translateY: sheetTranslateY }],
        },
      ]}
    >
      <View
        accessibilityRole="button"
        accessibilityLabel={isExpanded ? '장소 목록 닫기' : '장소 목록 열기'}
        style={styles.handleArea}
        {...panHandlers}
      >
        <Pressable onPress={onToggle} hitSlop={14}>
          <View style={styles.handle} />
        </Pressable>
      </View>
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        style={styles.sheetScroll}
        contentContainerStyle={styles.sheetContent}
      >
        <PlaceRail isLoading={isRecommendationsLoading} places={places} />
        <HotPlaceList
          isError={isRecommendationsError}
          isLoading={isRecommendationsLoading}
          places={places}
        />
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    backgroundColor: '#fdfdfd',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    bottom: 0,
    left: 0,
    paddingBottom: 0,
    position: 'absolute',
    right: 0,
    shadowColor: '#151920',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  handleArea: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
  },
  handle: {
    backgroundColor: '#dedfe5',
    borderRadius: 2,
    height: 4,
    width: 58,
  },
  sheetScroll: {
    flex: 1,
  },
  sheetContent: {
    paddingBottom: 28,
  },
});

export default MapBottomSheet;
