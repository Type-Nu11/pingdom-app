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
import ArtIcon from '../../../assets/v2icon/art_svg.svg';
import BeautyIcon from '../../../assets/v2icon/beati_svg.svg';
import CafeIcon from '../../../assets/v2icon/cafe_svg.svg';
import FashionIcon from '../../../assets/v2icon/fashion_svg.svg';
import FoodIcon from '../../../assets/v2icon/food_svg.svg';
import MusicIcon from '../../../assets/v2icon/music_svg.svg';
import PopupIcon from '../../../assets/v2icon/popup_svg.svg';
import GlassSurface, {
  supportsAndroidNativeBlur,
  supportsNativeLiquidGlass,
} from './GlassSurface';

const IOS = Platform.OS === 'ios';
const LIQUID_GLASS_AVAILABLE = supportsNativeLiquidGlass();
const ANDROID_NATIVE_BLUR_AVAILABLE = supportsAndroidNativeBlur();

export type MapCategoryId =
  | 'all'
  | 'art'
  | 'beauty'
  | 'cafe'
  | 'fashion'
  | 'food'
  | 'music'
  | 'popup';

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
  Icon?: React.ComponentType<{ color?: string; height: number; width: number }>;
  id: MapCategoryId;
  label: string;
}> = [
  { id: 'all', label: '전체' },
  { Icon: MusicIcon, id: 'music', label: '음악' },
  { Icon: FoodIcon, id: 'food', label: '음식점' },
  { Icon: FashionIcon, id: 'fashion', label: '패션' },
  { Icon: BeautyIcon, id: 'beauty', label: '뷰티' },
  { Icon: ArtIcon, id: 'art', label: '전시' },
  { Icon: CafeIcon, id: 'cafe', label: '카페' },
  { Icon: PopupIcon, id: 'popup', label: '팝업' },
];

const SearchIcon = () => (
  <Svg height={27} viewBox="0 0 24 24" width={27}>
    <Circle cx="10.5" cy="10.5" fill="none" r="7" stroke="#555963" strokeWidth="1.8" />
    <Line x1="15.7" x2="21" y1="15.7" y2="21" stroke="#555963" strokeLinecap="round" strokeWidth="1.8" />
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
        <View style={styles.headerShadow}>
          <View style={styles.headerSurface}>
            <GlassSurface
              glassEffectStyle="regular"
              intensity={100}
              pointerEvents="none"
              style={[styles.headerGlass, LIQUID_GLASS_AVAILABLE && styles.headerSurfaceLiquid]}
              tintColor="rgba(248,248,248,0.22)"
            />
            <View style={styles.searchShadow}>
              <GlassSurface
                intensity={76}
                pointerEvents="none"
                style={[styles.searchSurface, LIQUID_GLASS_AVAILABLE && styles.searchSurfaceLiquid]}
                tintColor="rgba(228,228,230,0.22)"
              />
              <View style={styles.searchContent}>
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
              </View>
            </View>
            <Pressable
              accessibilityLabel="프로필 열기"
              accessibilityRole="button"
              hitSlop={4}
              onPress={onProfilePress}
              style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}
            >
              <ProfileGlyph />
            </Pressable>
          </View>
        </View>
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
                styles.categoryChipShadow,
                pressed && styles.pressed,
              ]}
            >
              <GlassSurface
                intensity={74}
                interactive
                style={[
                  styles.categoryChip,
                  isActive && styles.categoryChipActive,
                  LIQUID_GLASS_AVAILABLE && styles.categoryChipLiquid,
                ]}
                tintColor={isActive ? 'rgba(255,59,108,0.18)' : 'rgba(248,249,250,0.20)'}
              >
                {Icon ? (
                  <Icon color={isActive ? '#FF245B' : '#5E5E66'} height={18} width={20} />
                ) : null}
                <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                  {label}
                </Text>
                <View
                  pointerEvents="none"
                  style={[styles.categoryChipStroke, isActive && styles.categoryChipStrokeActive]}
                />
              </GlassSurface>
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
    backgroundColor: IOS || ANDROID_NATIVE_BLUR_AVAILABLE
      ? ANDROID_NATIVE_BLUR_AVAILABLE
        ? 'rgba(248,249,250,0.56)'
        : 'rgba(248,249,250,0.32)'
      : 'rgba(248,249,250,0.90)',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 5,
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 13,
  },
  categoryChipActive: {
    backgroundColor: IOS || ANDROID_NATIVE_BLUR_AVAILABLE
      ? ANDROID_NATIVE_BLUR_AVAILABLE
        ? 'rgba(255,245,248,0.70)'
        : 'rgba(255,245,248,0.42)'
      : 'rgba(255,245,248,0.96)',
  },
  categoryChipLiquid: { backgroundColor: 'rgba(248,249,250,0.06)' },
  categoryChipShadow: {
    backgroundColor: IOS ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.01)',
    borderRadius: 18,
    elevation: 2,
    shadowColor: '#1A1D24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 7,
  },
  categoryChipStroke: {
    ...StyleSheet.absoluteFillObject,
    borderColor: 'rgba(255,255,255,0.76)',
    borderRadius: 18,
    borderWidth: 1,
  },
  categoryChipStrokeActive: { borderColor: '#FF3B6C' },
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
    paddingHorizontal: 8,
  },
  headerSurface: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.72)',
    borderRadius: 34,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    height: 68,
    overflow: 'hidden',
    padding: 7,
  },
  headerGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: IOS || ANDROID_NATIVE_BLUR_AVAILABLE
      ? ANDROID_NATIVE_BLUR_AVAILABLE
        ? 'rgba(248,248,248,0.48)'
        : 'rgba(248,248,248,0.30)'
      : 'rgba(248,248,248,0.92)',
    borderRadius: 34,
  },
  headerSurfaceLiquid: { backgroundColor: 'rgba(248,248,248,0.10)' },
  headerShadow: {
    backgroundColor: IOS ? 'rgba(248,248,248,0.16)' : 'rgba(248,248,248,0.01)',
    borderRadius: 34,
    elevation: 6,
    shadowColor: '#11151B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.11,
    shadowRadius: 14,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  profileButton: {
    alignItems: 'center',
    height: 52,
    justifyContent: 'center',
    width: 52,
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
    fontSize: 18,
    fontWeight: '600',
    height: '100%',
    padding: 0,
  },
  searchContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },
  searchSurface: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: IOS || ANDROID_NATIVE_BLUR_AVAILABLE
      ? ANDROID_NATIVE_BLUR_AVAILABLE
        ? 'rgba(228,228,230,0.48)'
        : 'rgba(228,228,230,0.34)'
      : 'rgba(228,228,230,0.96)',
    borderRadius: 27,
    boxShadow: 'inset 0 5px 13px rgba(32,36,43,0.17), inset 0 -2px 5px rgba(255,255,255,0.62)',
    overflow: 'hidden',
  },
  searchSurfaceLiquid: { backgroundColor: 'rgba(228,228,230,0.08)' },
  searchShadow: {
    backgroundColor: 'transparent',
    borderRadius: 27,
    flex: 1,
    height: 54,
    overflow: 'hidden',
  },
});
