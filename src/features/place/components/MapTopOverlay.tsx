import React from 'react';
import { BlurView } from 'expo-blur';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type ViewProps,
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

const IOS = Platform.OS === 'ios';
const LIQUID_GLASS_AVAILABLE = IOS
  && isGlassEffectAPIAvailable()
  && isLiquidGlassAvailable();

type OpticalGlassSurfaceProps = {
  children: React.ReactNode;
  intensity: number;
  interactive?: boolean;
  style: ViewProps['style'];
  tintColor: string;
};

const OpticalGlassSurface = ({
  children,
  intensity,
  interactive = false,
  style,
  tintColor,
}: OpticalGlassSurfaceProps) => {
  if (LIQUID_GLASS_AVAILABLE) {
    return (
      <GlassView
        colorScheme="light"
        glassEffectStyle="clear"
        isInteractive={interactive}
        style={style}
        tintColor={tintColor}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <BlurView intensity={IOS ? intensity : 0} style={style} tint="light">
      {children}
    </BlurView>
  );
};

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
  { Icon: FoodIcon, id: 'food', label: '음식점' },
  { Icon: MusicIcon, id: 'music', label: '음악' },
  { Icon: FashionIcon, id: 'fashion', label: '패션' },
  { Icon: ArtIcon, id: 'art', label: '전시' },
  { Icon: BeautyIcon, id: 'beauty', label: '뷰티' },
  { Icon: CafeIcon, id: 'cafe', label: '카페' },
  { Icon: PopupIcon, id: 'popup', label: '팝업' },
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
        <View style={styles.headerShadow}>
          <OpticalGlassSurface
            intensity={55}
            interactive
            style={[styles.headerSurface, LIQUID_GLASS_AVAILABLE && styles.headerSurfaceLiquid]}
            tintColor="rgba(248,248,248,0.16)"
          >
            <View style={styles.searchShadow}>
              <OpticalGlassSurface
                intensity={22}
                interactive
                style={[styles.searchSurface, LIQUID_GLASS_AVAILABLE && styles.searchSurfaceLiquid]}
                tintColor="rgba(228,228,230,0.22)"
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
              </OpticalGlassSurface>
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
          </OpticalGlassSurface>
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
              <OpticalGlassSurface
                intensity={28}
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
              </OpticalGlassSurface>
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
    backgroundColor: IOS ? 'rgba(248,249,250,0.32)' : 'rgba(248,249,250,0.90)',
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 13,
  },
  categoryChipActive: {
    backgroundColor: IOS ? 'rgba(255,245,248,0.42)' : 'rgba(255,245,248,0.96)',
    borderColor: '#FF3B6C',
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
    paddingHorizontal: 12,
  },
  headerSurface: {
    alignItems: 'center',
    backgroundColor: IOS ? 'rgba(248,248,248,0.45)' : 'rgba(248,248,248,0.92)',
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: 32,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    height: 64,
    overflow: 'hidden',
    padding: 7,
  },
  headerSurfaceLiquid: { backgroundColor: 'rgba(248,248,248,0.08)' },
  headerShadow: {
    backgroundColor: IOS ? 'rgba(248,248,248,0.16)' : 'rgba(248,248,248,0.01)',
    borderRadius: 32,
    elevation: 6,
    shadowColor: '#11151B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 13,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  profileButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 48,
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
    backgroundColor: IOS ? 'rgba(228,228,230,0.40)' : 'rgba(228,228,230,0.96)',
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 25,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    height: 50,
    overflow: 'hidden',
    paddingHorizontal: 14,
  },
  searchSurfaceLiquid: { backgroundColor: 'rgba(228,228,230,0.10)' },
  searchShadow: {
    backgroundColor: IOS ? 'rgba(255,255,255,0.15)' : 'rgba(228,228,230,0.01)',
    borderRadius: 25,
    elevation: 2,
    flex: 1,
    shadowColor: '#20242B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
});
