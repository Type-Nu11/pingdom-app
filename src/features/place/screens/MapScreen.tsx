import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import LikedIcon from '../../../assets/icons/Home/Liked.svg';
import PlaceRecommendIcon from '../../../assets/icons/Home/Home/placeRecommend.svg';
import SavedIcon from '../../../assets/icons/Home/Saved.svg';
import KakaoMapCard from '../components/KakaoMapCard';
import PlaceCard from '../components/PlaceCard';
import { useCurrentLocation } from '../hooks/useCurrentLocation';

const categories = [
  { id: 'food', label: 'Food', icon: '▥' },
  { id: 'music', label: 'Music', icon: '♪' },
  { id: 'fashion', label: 'Fashion', icon: '⌁' },
  { id: 'game', label: 'Game', icon: '⊙' },
];

const hotPlaces = [
  { id: 'hot-1', rank: 1, location: 'Seoul', username: 'woo._sm' },
  { id: 'hot-2', rank: 2, location: 'Seoul', username: 'woo._sm' },
  { id: 'hot-3', rank: 3, location: 'Seoul', username: 'woo._sm' },
];

const mapMarkers = [
  { id: 'music-1', lat: 35.6643, lng: 128.4137 },
  { id: 'music-2', lat: 35.66455, lng: 128.41425 },
  { id: 'music-3', lat: 35.66405, lng: 128.4147 },
  { id: 'music-4', lat: 35.66372, lng: 128.41385 },
  { id: 'music-5', lat: 35.66352, lng: 128.41435 },
  { id: 'music-6', lat: 35.66318, lng: 128.41355 },
];

const BASE_SCREEN_WIDTH = 430;
const BASE_SCREEN_HEIGHT = 932;
const BASE_SHEET_EXPANDED_HEIGHT = 386;
const BASE_SHEET_COLLAPSED_VISIBLE_HEIGHT = 154;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function MapScreen() {
  const { width, height } = useWindowDimensions();
  const { center, userLat, userLng, followUser } = useCurrentLocation();
  const uiScale = Math.min(width / BASE_SCREEN_WIDTH, height / BASE_SCREEN_HEIGHT, 1);
  const sheetExpandedHeight = Math.round(
    clamp(Math.min(BASE_SHEET_EXPANDED_HEIGHT * uiScale, height * 0.44), 250, BASE_SHEET_EXPANDED_HEIGHT)
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
  const actionBottomGap = 15;
  const topPaddingX = Math.round(clamp(22 * uiScale, 16, 22));
  const topPaddingTop = Math.round(clamp(44 * uiScale, 24, 44));
  const searchHeight = Math.round(clamp(64 * uiScale, 44, 64));
  const profileSize = Math.round(clamp(44 * uiScale, 32, 44));
  const chipHeight = Math.round(clamp(46 * uiScale, 34, 46));
  const sheetTranslateY = useRef(new Animated.Value(sheetCollapsedTranslateY)).current;
  const sheetOffsetY = useRef(sheetCollapsedTranslateY);
  const sheetExpandedRef = useRef(false);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);

  const snapSheet = (expanded: boolean) => {
    const nextValue = expanded ? 0 : sheetCollapsedTranslateY;

    sheetOffsetY.current = nextValue;
    sheetExpandedRef.current = expanded;
    setIsSheetExpanded(expanded);

    Animated.spring(sheetTranslateY, {
      toValue: nextValue,
      damping: 24,
      stiffness: 230,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    const nextValue = sheetExpandedRef.current ? 0 : sheetCollapsedTranslateY;

    sheetOffsetY.current = nextValue;
    sheetTranslateY.setValue(nextValue);
  }, [sheetCollapsedTranslateY, sheetTranslateY]);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) =>
      Math.abs(gesture.dy) > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    onPanResponderGrant: () => {
      sheetTranslateY.stopAnimation((value) => {
        sheetOffsetY.current = value;
      });
    },
    onPanResponderMove: (_, gesture) => {
      const nextValue = Math.min(
        Math.max(sheetOffsetY.current + gesture.dy, 0),
        sheetCollapsedTranslateY
      );

      sheetTranslateY.setValue(nextValue);
    },
    onPanResponderRelease: (_, gesture) => {
      const currentValue = sheetOffsetY.current + gesture.dy;
      const shouldExpand =
        gesture.vy < -0.35 ||
        (gesture.vy <= 0.35 && currentValue < sheetCollapsedTranslateY / 2);

      snapSheet(shouldExpand);
    },
    onPanResponderTerminate: () => {
      snapSheet(sheetExpandedRef.current);
    },
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
        markers={mapMarkers}
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
          <View
            style={[
              styles.searchBar,
              {
                borderRadius: Math.round(clamp(18 * uiScale, 14, 18)),
                height: searchHeight,
                paddingLeft: Math.round(clamp(18 * uiScale, 12, 18)),
                paddingRight: Math.round(clamp(12 * uiScale, 8, 12)),
              },
            ]}
          >
            <Text
              style={[
                styles.searchIcon,
                {
                  fontSize: Math.round(clamp(36 * uiScale, 25, 36)),
                  lineHeight: Math.round(clamp(39 * uiScale, 28, 39)),
                  marginRight: Math.round(clamp(8 * uiScale, 5, 8)),
                },
              ]}
            >
              ⌕
            </Text>
            <TextInput
              style={[styles.searchInput, { fontSize: Math.round(clamp(25 * uiScale, 17, 25)) }]}
              placeholder="Search..."
              placeholderTextColor="#81828c"
              returnKeyType="search"
            />
            <Pressable
              style={[
                styles.profileButton,
                {
                  borderRadius: profileSize / 2,
                  borderWidth: Math.round(clamp(4 * uiScale, 3, 4)),
                  height: profileSize,
                  width: profileSize,
                },
              ]}
            >
              <View
                style={[
                  styles.profileHead,
                  {
                    borderRadius: Math.round(clamp(8 * uiScale, 6, 8)),
                    height: Math.round(clamp(15 * uiScale, 11, 15)),
                    width: Math.round(clamp(15 * uiScale, 11, 15)),
                  },
                ]}
              />
              <View
                style={[
                  styles.profileBody,
                  {
                    height: Math.round(clamp(19 * uiScale, 14, 19)),
                    width: Math.round(clamp(30 * uiScale, 23, 30)),
                  },
                ]}
              />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.categoryList,
              {
                gap: Math.round(clamp(12 * uiScale, 8, 12)),
                paddingRight: topPaddingX,
                paddingTop: Math.round(clamp(20 * uiScale, 12, 20)),
              },
            ]}
          >
            {categories.map((category) => (
              <Pressable
                key={category.id}
                style={[
                  styles.categoryChip,
                  {
                    borderRadius: chipHeight / 2,
                    height: chipHeight,
                    paddingHorizontal: Math.round(clamp(18 * uiScale, 12, 18)),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryIcon,
                    {
                      fontSize: Math.round(clamp(24 * uiScale, 17, 24)),
                      marginRight: Math.round(clamp(8 * uiScale, 5, 8)),
                    },
                  ]}
                >
                  {category.icon}
                </Text>
                <Text style={[styles.categoryText, { fontSize: Math.round(clamp(19 * uiScale, 14, 19)) }]}>
                  {category.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>

      <Animated.View
        style={[
          styles.quickActions,
          {
            bottom: sheetExpandedHeight + actionBottomGap,
            left: sideGap,
            right: rightGap,
            transform: [{ translateY: sheetTranslateY }],
          },
        ]}
      >
        <View style={styles.quickActionGroup}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="좋아요 장소 보기"
            hitSlop={8}
            style={styles.quickActionButton}
          >
            <LikedIcon height={smallActionHeight} width={smallActionWidth} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="저장한 장소 보기"
            hitSlop={8}
            style={styles.quickActionButton}
          >
            <SavedIcon height={smallActionHeight} width={smallActionWidth} />
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="장소 추가"
          hitSlop={8}
          style={[
            styles.addPlaceButton,
            {
              borderRadius: 100,
              paddingHorizontal: 12,
              paddingVertical: 8,
            },
          ]}
        >
          <PlaceRecommendIcon height={addIconSize} width={addIconSize} />
          <Text style={[styles.addPlaceText, { fontSize: addTextSize, lineHeight: addTextSize + 4 }]}>
            장소 게시
          </Text>
        </Pressable>
      </Animated.View>

      <Animated.View
        style={[
          styles.bottomSheet,
          {
            height: sheetExpandedHeight,
            transform: [{ translateY: sheetTranslateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isSheetExpanded ? '장소 목록 닫기' : '장소 목록 열기'}
          onPress={() => snapSheet(!isSheetExpanded)}
          style={styles.handleArea}
        >
          <View style={styles.handle} />
        </Pressable>
        <View style={styles.placeRail}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.placeScroller}
            contentContainerStyle={styles.placeList}
          >
            <PlaceCard />
            <PlaceCard />
            <PlaceCard />
            <PlaceCard />
            <PlaceCard dimmed />
          </ScrollView>
        </View>

        <View style={styles.hotSection}>
          <Text style={styles.hotTitle}>
            <Text style={styles.hotTitleIcon}>●</Text> Hot Place
          </Text>

          {hotPlaces.map((place) => (
            <View key={place.id} style={styles.hotRow}>
              <View style={[styles.rankBadge, place.rank !== 1 && styles.rankBadgeMuted]}>
                <Text style={[styles.rankText, place.rank !== 1 && styles.rankTextMuted]}>
                  {place.rank}
                </Text>
              </View>
              <View style={styles.avatar}>
                <View style={styles.avatarHead} />
                <View style={styles.avatarBody} />
              </View>
              <View>
                <Text style={styles.hotLocation}>{place.location}</Text>
                <Text style={styles.hotUsername}>{place.username}</Text>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>
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
  searchBar: {
    alignItems: 'center',
    backgroundColor: '#fbfbfd',
    borderRadius: 18,
    flexDirection: 'row',
    height: 64,
    paddingLeft: 18,
    paddingRight: 12,
    shadowColor: '#162033',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
  },
  searchIcon: {
    color: '#757884',
    fontSize: 36,
    lineHeight: 39,
    marginRight: 8,
  },
  searchInput: {
    color: '#202330',
    flex: 1,
    fontSize: 25,
    fontWeight: '600',
    height: '100%',
    paddingVertical: 0,
  },
  profileButton: {
    alignItems: 'center',
    borderColor: '#686973',
    borderRadius: 22,
    borderWidth: 4,
    height: 44,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 44,
  },
  profileHead: {
    backgroundColor: '#686973',
    borderRadius: 8,
    height: 15,
    marginTop: 3,
    width: 15,
  },
  profileBody: {
    backgroundColor: '#686973',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: 19,
    marginTop: 2,
    width: 30,
  },
  categoryList: {
    gap: 12,
    paddingRight: 22,
    paddingTop: 20,
  },
  categoryChip: {
    alignItems: 'center',
    backgroundColor: '#f9fafc',
    borderRadius: 18,
    flexDirection: 'row',
    height: 46,
    paddingHorizontal: 18,
    shadowColor: '#243041',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
  },
  categoryIcon: {
    color: '#ff3f7b',
    fontSize: 24,
    fontWeight: '900',
    marginRight: 8,
  },
  categoryText: {
    color: '#757780',
    fontSize: 19,
    fontWeight: '800',
  },
  quickActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
  },
  quickActionGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  quickActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlaceButton: {
    alignItems: 'center',
    backgroundColor: '#ff4a75',
    borderColor: '#f8f8f8',
    borderWidth: 2,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 2,
    ...Platform.select({
      android: {
        elevation: 3,
      },
    }),
  },
  addPlaceText: {
    color: '#fff',
    fontWeight: '900',
    includeFontPadding: false,
  },
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
    paddingBottom: 18,
    paddingTop: 11,
  },
  handle: {
    backgroundColor: '#dedfe5',
    borderRadius: 2,
    height: 4,
    width: 58,
  },
  placeRail: {
    borderColor: '#e5e6eb',
    borderRadius: 18,
    borderWidth: 1,
    height: 94,
    justifyContent: 'center',
    marginHorizontal: 22,
    overflow: 'hidden',
  },
  placeScroller: {
    flexGrow: 0,
  },
  placeList: {
    alignItems: 'center',
    minHeight: 72,
    paddingHorizontal: 12,
  },
  hotSection: {
    paddingTop: 22,
  },
  hotTitle: {
    color: '#3a3b43',
    fontSize: 25,
    fontWeight: '900',
    marginBottom: 13,
    paddingHorizontal: 42,
  },
  hotTitleIcon: {
    color: '#ff2f70',
  },
  hotRow: {
    alignItems: 'center',
    borderTopColor: '#ececf0',
    borderTopWidth: 1,
    flexDirection: 'row',
    height: 73,
    paddingHorizontal: 43,
  },
  rankBadge: {
    alignItems: 'center',
    borderColor: '#ff9f1a',
    borderRadius: 13,
    borderWidth: 3,
    height: 27,
    justifyContent: 'center',
    marginRight: 17,
    width: 27,
  },
  rankBadgeMuted: {
    borderColor: '#7d7f8a',
  },
  rankText: {
    color: '#df8600',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
  rankTextMuted: {
    color: '#747681',
  },
  avatar: {
    alignItems: 'center',
    borderColor: '#737580',
    borderRadius: 17,
    borderWidth: 4,
    height: 34,
    justifyContent: 'center',
    marginRight: 11,
    overflow: 'hidden',
    width: 34,
  },
  avatarHead: {
    backgroundColor: '#737580',
    borderRadius: 6,
    height: 11,
    marginTop: 2,
    width: 11,
  },
  avatarBody: {
    backgroundColor: '#737580',
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    height: 14,
    marginTop: 2,
    width: 24,
  },
  hotLocation: {
    color: '#6e7079',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 3,
  },
  hotUsername: {
    color: '#111217',
    fontSize: 12,
    fontWeight: '800',
  },
});
