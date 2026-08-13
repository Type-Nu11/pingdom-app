import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchAsset from '../../../assets/icons/search.svg';
import ArtIcon from '../../../assets/v2icon/art_svg.svg';
import BeautyIcon from '../../../assets/v2icon/beati_svg.svg';
import CafeIcon from '../../../assets/v2icon/cafe_svg.svg';
import EtcIcon from '../../../assets/v2icon/etc_svg.svg';
import FashionIcon from '../../../assets/v2icon/fashion_svg.svg';
import FoodIcon from '../../../assets/v2icon/food_svg.svg';
import MusicIcon from '../../../assets/v2icon/music_svg.svg';
import PopupIcon from '../../../assets/v2icon/popup_svg.svg';
import ProfileAsset from '../../../assets/v2icon/profile_svg.svg';
import GlassSurface, {
  supportsNativeLiquidGlass,
} from './GlassSurface';

const IOS = Platform.OS === 'ios';
const LIQUID_GLASS_AVAILABLE = supportsNativeLiquidGlass();

export type MapCategoryId =
  | 'all'
  | 'art'
  | 'beauty'
  | 'cafe'
  | 'etc'
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
  { Icon: PopupIcon, id: 'popup', label: '팝업' },
  { Icon: FashionIcon, id: 'fashion', label: '패션' },
  { Icon: BeautyIcon, id: 'beauty', label: '뷰티' },
  { Icon: ArtIcon, id: 'art', label: '전시' },
  { Icon: CafeIcon, id: 'cafe', label: '카페' },
  { Icon: EtcIcon, id: 'etc', label: '기타' },
];

export default function MapTopOverlay({
  activeCategory,
  onCategoryChange,
  onProfilePress,
  onSearchFocus,
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
              tintColor="rgba(248,248,248,0.56)"
            />
            <View pointerEvents="none" style={styles.headerFrost} />
            <View style={styles.searchShadow}>
              <GlassSurface
                glassEffectStyle="regular"
                intensity={96}
                pointerEvents="none"
                style={[styles.searchSurface, LIQUID_GLASS_AVAILABLE && styles.searchSurfaceLiquid]}
                tintColor="rgba(228,228,230,0.60)"
              />
              <View pointerEvents="none" style={styles.searchFrost} />
              <Pressable
                accessibilityLabel="장소 검색"
                accessibilityRole="button"
                onPress={onSearchFocus}
                style={styles.searchContent}
              >
                <SearchAsset height={20} width={20} />
                <Text
                  numberOfLines={1}
                  style={[styles.searchInput, !query && styles.searchPlaceholder]}
                >
                  {query || '검색하기'}
                </Text>
              </Pressable>
            </View>
            <Pressable
              accessibilityLabel="프로필 열기"
              accessibilityRole="button"
              hitSlop={4}
              onPress={onProfilePress}
              style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}
            >
              <ProfileAsset height={40} width={40} />
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
              <View style={styles.categoryChipClip}>
                <GlassSurface
                  glassEffectStyle="regular"
                  intensity={100}
                  pointerEvents="none"
                  style={styles.categoryChipGlass}
                  tintColor={isActive ? 'rgba(255,201,211,0.24)' : 'rgba(255,255,255,0.36)'}
                />
                <View
                  pointerEvents="none"
                  style={[styles.categoryChipFrost, isActive && styles.categoryChipFrostActive]}
                />
                <View style={styles.categoryChipContent}>
                  {Icon ? (
                    <Icon color={isActive ? '#FF245B' : '#5E5E66'} height={18} width={20} />
                  ) : null}
                  <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                    {label}
                  </Text>
                </View>
                <View
                  pointerEvents="none"
                  style={[styles.categoryChipStroke, isActive && styles.categoryChipStrokeActive]}
                />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  categoryChipContent: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 6,
    height: 34,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  categoryChipClip: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryChipFrost: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.44)',
  },
  categoryChipFrostActive: { backgroundColor: 'rgba(255,201,211,0.32)' },
  categoryChipGlass: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  categoryChipShadow: {
    backgroundColor: IOS ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.01)',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  categoryChipStroke: {
    ...StyleSheet.absoluteFillObject,
    borderColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryChipStrokeActive: { borderColor: 'rgba(255,74,117,0.96)' },
  categoryContent: {
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  categoryLabel: {
    color: '#5E5E66',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
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
  headerFrost: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248,248,248,0.42)',
    borderRadius: 29,
  },
  headerSurface: {
    alignItems: 'center',
    borderRadius: 29,
    flexDirection: 'row',
    gap: 16,
    height: 60,
    overflow: 'hidden',
    padding: 8,
  },
  headerGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248,248,248,0.56)',
    borderRadius: 29,
  },
  headerSurfaceLiquid: { backgroundColor: 'rgba(248,248,248,0.12)' },
  headerShadow: {
    backgroundColor: IOS ? 'rgba(248,248,248,0.16)' : 'rgba(248,248,248,0.01)',
    borderRadius: 29,
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  profileButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
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
    fontWeight: '400',
    lineHeight: 21,
  },
  searchPlaceholder: { color: '#5E6069' },
  searchContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
  },
  searchFrost: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(228,228,230,0.54)',
    borderRadius: 26,
  },
  searchSurface: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(228,228,230,0.60)',
    borderRadius: 26,
    boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.10)',
    overflow: 'hidden',
  },
  searchSurfaceLiquid: { backgroundColor: 'rgba(228,228,230,0.12)' },
  searchShadow: {
    backgroundColor: 'transparent',
    borderRadius: 26,
    flex: 1,
    height: 44,
    overflow: 'hidden',
  },
});
