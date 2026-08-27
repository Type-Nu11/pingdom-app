import React from 'react';
import SearchAsset from '../../../assets/v2/icons/search.svg';
import ArtIcon from '../../../assets/v2/icons/place/art_svg.svg';
import BeautyIcon from '../../../assets/v2/icons/place/beati_svg.svg';
import CafeIcon from '../../../assets/v2/icons/place/cafe_svg.svg';
import EtcIcon from '../../../assets/v2/icons/place/etc_svg.svg';
import FashionIcon from '../../../assets/v2/icons/place/fashion_svg.svg';
import FoodIcon from '../../../assets/v2/icons/place/food_svg.svg';
import HeritageIcon from '../../../assets/v2/icons/place/heritage.svg';
import MusicIcon from '../../../assets/v2/icons/place/music_svg.svg';
import PopupIcon from '../../../assets/v2/icons/place/popup_svg.svg';
import ProfileAsset from '../../../assets/v2/icons/place/profile_svg.svg';
import * as S from '../styles/MapTopOverlay.styles';

export type MapCategoryId =
  | 'all'
  | 'art'
  | 'beauty'
  | 'cafe'
  | 'etc'
  | 'fashion'
  | 'food'
  | 'heritage'
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
  { Icon: PopupIcon, id: 'popup', label: '팝업' },
  { Icon: FashionIcon, id: 'fashion', label: '패션' },
  { Icon: BeautyIcon, id: 'beauty', label: '뷰티' },
  { Icon: ArtIcon, id: 'art', label: '전시' },
  { Icon: CafeIcon, id: 'cafe', label: '카페' },
  { Icon: HeritageIcon, id: 'heritage', label: '문화재' },
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
    <S.SafeOverlay edges={['top']} pointerEvents="box-none">
      <S.Header>
        <S.HeaderShadow>
          <S.HeaderSurface>
            <S.HeaderGlass
              bottomShade={false}
              cornerRadius={25}
              glassEffectStyle="regular"
              highlightOpacity={0.16}
              intensity={32}
              pointerEvents="none"
              rimColor="transparent"
              tintColor="rgba(255,255,255,0.76)"
            />
            <S.SearchShadow>
              <S.SearchGlass
                bottomShade={false}
                cornerRadius={20}
                glassEffectStyle="regular"
                highlightOpacity={0.20}
                pointerEvents="none"
                rimColor="transparent"
                tintColor="rgba(242,242,245,0.86)"
              />
              <S.SearchContent
                accessibilityLabel="장소 검색"
                accessibilityRole="button"
                onPress={onSearchFocus}
              >
                <SearchAsset height={18} width={18} />
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
              <ProfileAsset height={34} width={34} />
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
                $active={isActive}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                key={`${id}-${index}`}
                onPress={() => onCategoryChange(id)}
                style={({ pressed }) => pressed ? { opacity: 0.72, transform: [{ scale: 0.98 }] } : undefined}
              >
                <S.CategoryChipClip>
                  <S.CategoryChipGlass
                    bottomShade={false}
                    cornerRadius={15}
                    glassEffectStyle="regular"
                    highlightOpacity={isActive ? 0.18 : 0.14}
                    pointerEvents="none"
                    rimColor="transparent"
                    tintColor={isActive ? 'rgba(255,201,211,0.24)' : 'rgba(255,255,255,0.95)'}
                  />
                  <S.CategoryChipContent>
                    {Icon ? (
                      <Icon color={isActive ? '#FF245B' : '#5E5E66'} height={16} width={17} />
                    ) : null}
                    <S.CategoryLabel $active={isActive}>{label}</S.CategoryLabel>
                  </S.CategoryChipContent>
                </S.CategoryChipClip>
              </S.CategoryChipButton>
            );
          })}
        </S.CategoryContent>
      </S.CategoryScroll>
    </S.SafeOverlay>
  );
}
