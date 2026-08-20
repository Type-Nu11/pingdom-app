import React from 'react';
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
import * as S from '../styles/MapTopOverlay.styles';

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
  androidBlurEnabled?: boolean;
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
  { Icon: PopupIcon, id: 'popup', label: '팝업' },
  { Icon: FashionIcon, id: 'fashion', label: '패션' },
  { Icon: BeautyIcon, id: 'beauty', label: '뷰티' },
  { Icon: ArtIcon, id: 'art', label: '전시' },
  { Icon: CafeIcon, id: 'cafe', label: '카페' },
  { Icon: EtcIcon, id: 'etc', label: '기타' },
];

export default function MapTopOverlay({
  activeCategory,
  androidBlurEnabled = true,
  onCategoryChange,
  onProfilePress,
  onSearchFocus,
  query,
}: MapTopOverlayProps) {
  return (
    <S.SafeOverlay edges={['top']} pointerEvents="box-none">
      <S.Header>
        <S.HeaderShadow>
          <S.HeaderSurface>
            <S.HeaderGlass
              androidBlurEnabled={androidBlurEnabled}
              glassEffectStyle="regular"
              intensity={48}
              pointerEvents="none"
              tintColor="rgba(248,248,248,0.12)"
            />
            <S.SearchShadow>
              <S.SearchGlass
                androidBlurEnabled={false}
                glassEffectStyle="regular"
                pointerEvents="none"
                tintColor="rgba(238,238,242,0.22)"
              />
              <S.SearchContent
                accessibilityLabel="장소 검색"
                accessibilityRole="button"
                onPress={onSearchFocus}
              >
                <SearchAsset height={20} width={20} />
                <S.SearchInput
                  $isPlaceholder={!query}
                  numberOfLines={1}
                >
                  {query || '검색하기'}
                </S.SearchInput>
              </S.SearchContent>
            </S.SearchShadow>
            <S.ProfileButton
              accessibilityLabel="프로필 열기"
              accessibilityRole="button"
              hitSlop={4}
              onPress={onProfilePress}
              style={({ pressed }) => pressed ? { opacity: 0.72, transform: [{ scale: 0.98 }] } : undefined}
            >
              <ProfileAsset height={40} width={40} />
            </S.ProfileButton>
          </S.HeaderSurface>
        </S.HeaderShadow>
      </S.Header>

      <S.CategoryScroll
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <S.CategoryContent>
          {categories.map(({ Icon, id, label }, index) => {
            const isActive = activeCategory === id;

            return (
              <S.CategoryChipButton
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                key={`${id}-${index}`}
                onPress={() => onCategoryChange(id)}
                style={({ pressed }) => pressed ? { opacity: 0.72, transform: [{ scale: 0.98 }] } : undefined}
              >
                <S.CategoryChipClip>
                  <S.CategoryChipGlass
                    androidBlurEnabled={false}
                    glassEffectStyle="regular"
                    pointerEvents="none"
                    tintColor={isActive ? 'rgba(255,201,211,0.34)' : 'rgba(255,255,255,0.30)'}
                  />
                  <S.CategoryChipContent>
                    {Icon ? (
                      <Icon color={isActive ? '#FF245B' : '#5E5E66'} height={18} width={20} />
                    ) : null}
                    <S.CategoryLabel $active={isActive}>{label}</S.CategoryLabel>
                  </S.CategoryChipContent>
                  <S.CategoryChipStroke $active={isActive} pointerEvents="none" />
                </S.CategoryChipClip>
              </S.CategoryChipButton>
            );
          })}
        </S.CategoryContent>
      </S.CategoryScroll>
    </S.SafeOverlay>
  );
}
