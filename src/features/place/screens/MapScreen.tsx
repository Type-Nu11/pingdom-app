import React, { useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
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

const SHEET_EXPANDED_HEIGHT = 386;
const SHEET_COLLAPSED_VISIBLE_HEIGHT = 154;
const SHEET_COLLAPSED_TRANSLATE_Y = SHEET_EXPANDED_HEIGHT - SHEET_COLLAPSED_VISIBLE_HEIGHT;

export default function MapScreen() {
  const { center, userLat, userLng, followUser } = useCurrentLocation();
  const sheetTranslateY = useRef(new Animated.Value(SHEET_COLLAPSED_TRANSLATE_Y)).current;
  const sheetOffsetY = useRef(SHEET_COLLAPSED_TRANSLATE_Y);
  const sheetExpandedRef = useRef(false);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);

  const snapSheet = (expanded: boolean) => {
    const nextValue = expanded ? 0 : SHEET_COLLAPSED_TRANSLATE_Y;

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

  const panResponder = useRef(
    PanResponder.create({
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
          SHEET_COLLAPSED_TRANSLATE_Y
        );

        sheetTranslateY.setValue(nextValue);
      },
      onPanResponderRelease: (_, gesture) => {
        const currentValue = sheetOffsetY.current + gesture.dy;
        const shouldExpand =
          gesture.vy < -0.35 ||
          (gesture.vy <= 0.35 && currentValue < SHEET_COLLAPSED_TRANSLATE_Y / 2);

        snapSheet(shouldExpand);
      },
      onPanResponderTerminate: () => {
        snapSheet(sheetExpandedRef.current);
      },
    })
  ).current;

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
        <View style={styles.topPanel} pointerEvents="box-none">
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="#81828c"
              returnKeyType="search"
            />
            <Pressable style={styles.profileButton}>
              <View style={styles.profileHead} />
              <View style={styles.profileBody} />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            {categories.map((category) => (
              <Pressable key={category.id} style={styles.categoryChip}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryText}>{category.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>

      <Animated.View style={[styles.quickActions, { transform: [{ translateY: sheetTranslateY }] }]}>
        <Pressable style={styles.quickActionButton}>
          <Text style={styles.quickActionText}>♥</Text>
        </Pressable>
        <Pressable style={styles.quickActionButton}>
          <Text style={styles.quickActionText}>▰</Text>
        </Pressable>
      </Animated.View>

      <Animated.View
        style={[
          styles.bottomSheet,
          {
            height: SHEET_EXPANDED_HEIGHT,
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.placeList}
        >
          <PlaceCard />
          <PlaceCard />
          <PlaceCard />
          <PlaceCard />
          <PlaceCard dimmed />
        </ScrollView>

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
    bottom: SHEET_EXPANDED_HEIGHT + 18,
    flexDirection: 'row',
    gap: 12,
    left: 42,
    position: 'absolute',
  },
  quickActionButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    height: 42,
    justifyContent: 'center',
    shadowColor: '#151920',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    width: 42,
  },
  quickActionText: {
    color: '#ff2f70',
    fontSize: 26,
    fontWeight: '900',
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
  placeList: {
    borderColor: '#e5e6eb',
    borderRadius: 18,
    borderWidth: 1,
    marginHorizontal: 22,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
