import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import type { PlaceCategory } from '../model/place.types';
import {
  EtcGlyph,
  FashionGlyph,
  FoodGlyph,
  GameGlyph,
  MusicGlyph,
} from './CategoryGlyphs';
import GlassSurface from './GlassSurface';

export type MapCategoryId = 'all' | 'beauty' | PlaceCategory;

type MapTopOverlayProps = {
  activeCategory: MapCategoryId;
  onCategoryChange: (category: MapCategoryId) => void;
  onProfilePress?: () => void;
  onQueryChange: (query: string) => void;
  onSearchFocus: () => void;
  onSubmitSearch: () => void;
  query: string;
};

const categories: Array<{
  Icon?: React.ComponentType<{ height: number; width: number }>;
  id: MapCategoryId;
  label: string;
}> = [
  { id: 'all', label: '전체' },
  { Icon: MusicGlyph, id: 'music', label: '음악' },
  { Icon: FoodGlyph, id: 'food', label: '음식점' },
  { Icon: FashionGlyph, id: 'fashion', label: '패션' },
  { id: 'beauty', label: '뷰티' },
  { Icon: GameGlyph, id: 'game', label: '게임' },
  { Icon: EtcGlyph, id: 'etc', label: '기타' },
];

const SearchIcon = () => (
  <Svg height={25} viewBox="0 0 24 24" width={25}>
    <Circle cx="10.5" cy="10.5" fill="none" r="7" stroke="#555963" strokeWidth="2" />
    <Line x1="15.7" x2="21" y1="15.7" y2="21" stroke="#555963" strokeLinecap="round" strokeWidth="2" />
  </Svg>
);

const ProfileGlyph = () => (
  <Svg height={40} viewBox="0 0 40 40" width={40}>
    <Circle cx="20" cy="20" fill="#62636C" r="20" />
    <Circle cx="20" cy="14.5" fill="#FFFFFF" r="6.2" />
    <Path d="M8.8 33.2c1.1-6.1 5.2-9.5 11.2-9.5s10.1 3.4 11.2 9.5A17.8 17.8 0 0 1 20 37a17.8 17.8 0 0 1-11.2-3.8Z" fill="#FFFFFF" />
  </Svg>
);

export default function MapTopOverlay({
  activeCategory,
  onCategoryChange,
  onProfilePress,
  onQueryChange,
  onSearchFocus,
  onSubmitSearch,
  query,
}: MapTopOverlayProps) {
  return (
    <SafeAreaView edges={['top']} pointerEvents="box-none" style={styles.safeArea}>
      <View style={styles.header}>
        <GlassSurface
          intensity={74}
          interactive
          style={styles.searchSurface}
          tintColor="rgba(255,255,255,0.28)"
        >
          <SearchIcon />
          <TextInput
            accessibilityLabel="장소 검색"
            autoCorrect={false}
            onChangeText={onQueryChange}
            onFocus={onSearchFocus}
            onSubmitEditing={onSubmitSearch}
            placeholder="검색하기"
            placeholderTextColor="#41434A"
            returnKeyType="search"
            style={styles.searchInput}
            value={query}
          />
        </GlassSurface>
        <Pressable
          accessibilityLabel="프로필 열기"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onProfilePress}
          style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}
        >
          <ProfileGlyph />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.categoryContent}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
      >
        {categories.map(({ Icon, id, label }, index) => {
          const isActive = activeCategory === id;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              key={`${id}-${index}`}
              onPress={() => onCategoryChange(id)}
              style={({ pressed }) => [
                styles.categoryChip,
                isActive && styles.categoryChipActive,
                pressed && styles.pressed,
              ]}
            >
              {Icon ? <Icon height={18} width={20} /> : null}
              <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  categoryChip: {
    alignItems: 'center',
    backgroundColor: 'rgba(248,249,250,0.88)',
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: 18,
    borderWidth: 1,
    elevation: 2,
    flexDirection: 'row',
    gap: 5,
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 13,
    shadowColor: '#1A1D24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 7,
  },
  categoryChipActive: {
    backgroundColor: 'rgba(255,245,248,0.96)',
    borderColor: '#FF3B6C',
  },
  categoryContent: {
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  categoryLabel: {
    color: '#696B74',
    fontSize: 13,
    fontWeight: '700',
  },
  categoryLabelActive: {
    color: '#FF245B',
  },
  categoryScroll: {
    flexGrow: 0,
    marginTop: 3,
    overflow: 'visible',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  profileButton: {
    alignItems: 'center',
    height: 46,
    justifyContent: 'center',
    width: 42,
  },
  safeArea: {
    left: 0,
    paddingTop: Platform.OS === 'android' ? 6 : 2,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 40,
  },
  searchInput: {
    color: '#1D1E23',
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    height: '100%',
    padding: 0,
  },
  searchSurface: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.86)',
    borderRadius: 22,
    borderWidth: 1,
    elevation: 5,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    height: 46,
    overflow: 'hidden',
    paddingHorizontal: 14,
    shadowColor: '#11151B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.13,
    shadowRadius: 11,
  },
});
