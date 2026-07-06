import React, { useEffect, useState } from 'react';
import {
  Animated,
  GestureResponderHandlers,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import HotPlaceIcon from '../../../assets/icons/hotplace.svg';
import MypingIcon from '../../../assets/icons/map/Myping.svg';
import type { RecommendedPlace } from '../model/place.types';
import HotPlaceList from './HotPlaceList';
import PlaceRail from './PlaceRail';
import RecommendedPlaceGrid from './RecommendedPlaceGrid';

type MapBottomSheetProps = {
  height: number;
  isExpanded: boolean;
  isRecommendationsError?: boolean;
  isRecommendationsLoading?: boolean;
  onPlacePress?: (place: RecommendedPlace) => void;
  onToggle: () => void;
  panHandlers: GestureResponderHandlers;
  places: RecommendedPlace[];
  recommendedPlaces: RecommendedPlace[];
  sheetTranslateY: Animated.Value;
};

type BottomSheetTab = 'hot' | 'recommend';

const MapBottomSheet = ({
  height,
  isExpanded,
  isRecommendationsError = false,
  isRecommendationsLoading = false,
  onPlacePress,
  onToggle,
  panHandlers,
  places,
  recommendedPlaces,
  sheetTranslateY,
}: MapBottomSheetProps) => {
  const [activeTab, setActiveTab] = useState<BottomSheetTab>('recommend');
  const isHotTab = activeTab === 'hot';

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    console.log('[MapBottomSheet]', {
      activeTab,
      isRecommendationsError,
      isRecommendationsLoading,
      placesCount: places.length,
      recommendedPlacesCount: recommendedPlaces.length,
    });
  }, [
    activeTab,
    isRecommendationsError,
    isRecommendationsLoading,
    places.length,
    recommendedPlaces.length,
  ]);

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
        <View style={styles.tabBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="우리 지역 핫플 보기"
            style={[styles.tabButton, isHotTab && styles.activeTabButton]}
            onPress={() => setActiveTab('hot')}
          >
            <HotPlaceIcon
              height={18}
              opacity={isHotTab ? 1 : 0.54}
              width={15}
            />
            <Text style={[styles.tabText, isHotTab && styles.activeTabText]}>
              우리 지역 핫플
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="추천 장소 보기"
            style={[styles.tabButton, !isHotTab && styles.activeTabButton]}
            onPress={() => setActiveTab('recommend')}
          >
            <MypingIcon
              height={20}
              opacity={isHotTab ? 0.62 : 1}
              width={16}
            />
            <Text style={[styles.tabText, !isHotTab && styles.activeTabText]}>
              추천 장소
            </Text>
          </Pressable>
        </View>
        {isHotTab ? (
          <>
            <PlaceRail
              isLoading={isRecommendationsLoading}
              places={places}
              onPlacePress={onPlacePress}
            />
            <HotPlaceList
              isError={isRecommendationsError}
              isLoading={isRecommendationsLoading}
              onPlacePress={onPlacePress}
              places={places}
            />
          </>
        ) : (
          <RecommendedPlaceGrid
            isError={isRecommendationsError}
            isLoading={isRecommendationsLoading}
            onPlacePress={onPlacePress}
            places={recommendedPlaces}
          />
        )}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    backgroundColor: '#fdfdfd',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    height: 26,
    justifyContent: 'center',
  },
  handle: {
    backgroundColor: '#dedfe5',
    borderRadius: 2,
    height: 4,
    width: 46,
  },
  sheetScroll: {
    flex: 1,
  },
  sheetContent: {
    paddingBottom: 24,
  },
  tabBar: {
    alignItems: 'center',
    backgroundColor: '#e3e3e6',
    borderRadius: 13,
    flexDirection: 'row',
    gap: 2,
    height: 44,
    marginBottom: 12,
    marginHorizontal: 24,
    padding: 4,
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    height: '100%',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#fff',
  },
  tabText: {
    color: '#6f717b',
    fontSize: 14,
    fontWeight: '900',
  },
  activeTabText: {
    color: '#ff4a75',
  },
});

export default MapBottomSheet;
