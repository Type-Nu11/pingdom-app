import { Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { liquidGlass } from '../../../shared/theme/liquidGlass';
import FrostedSurface from '../components/FrostedSurface';
import GlassSurface from '../components/GlassSurface';

export const MAP_TOP_OVERLAY_METRICS = {
  categoryHeight: 34,
  categoryLabelSize: 14,
  headerHeight: 60,
  profileIconSize: 44,
  searchHeight: 44,
  searchIconSize: 20,
  searchLabelSize: 18,
} as const;

export const SafeOverlay = styled(SafeAreaView)`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 40;
  padding-top: ${Platform.OS === 'android' ? 3 : 1}px;
`;

export const Header = styled.View`
  padding-right: 8px;
  padding-left: 8px;
`;

export const RefreshIndicatorContainer = styled(Animated.View)`
  position: absolute;
  z-index: 100;
  align-self: center;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: rgba(255, 255, 255, 0.96);
  elevation: 12;
  shadow-color: #10141a;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.14;
  shadow-radius: 6px;
`;

export const PullGestureArea = styled.View``;

export const HeaderShadow = styled.View`
  border-radius: ${liquidGlass.header.radius}px;
  background-color: ${liquidGlass.shadowFill};
`;

export const HeaderSurface = styled.View`
  flex-direction: row;
  align-items: center;
  height: ${MAP_TOP_OVERLAY_METRICS.headerHeight}px;
  gap: 8px;
  padding: 8px;
  border-radius: ${liquidGlass.header.radius}px;
  overflow: hidden;
`;

export const HeaderGlass = styled(FrostedSurface)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: ${liquidGlass.header.radius}px;
`;

export const SearchShadow = styled.View`
  flex: 1;
  height: ${MAP_TOP_OVERLAY_METRICS.searchHeight}px;
  border-radius: ${liquidGlass.search.radius}px;
  background-color: transparent;
  overflow: hidden;
`;

export const SearchGlass = styled(FrostedSurface)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  align-items: center;
  border-radius: ${liquidGlass.search.radius}px;
  overflow: hidden;
`;

export const SearchInsetShadow = styled.View`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: ${liquidGlass.search.radius}px;
`;

export const SearchContent = styled.Pressable`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding-right: 12px;
  padding-left: 12px;
`;

export const SearchInput = styled.Text.attrs({ maxFontSizeMultiplier: 1 })<{ $isPlaceholder: boolean }>`
  flex: 1;
  color: ${({ $isPlaceholder }) => ($isPlaceholder ? '#5E5E66' : '#1D1E23')};
  font-size: ${MAP_TOP_OVERLAY_METRICS.searchLabelSize}px;
  font-weight: 500;
  line-height: 23px;
`;

export const ProfileButton = styled.Pressable`
  align-items: center;
  justify-content: center;
  width: ${MAP_TOP_OVERLAY_METRICS.searchHeight}px;
  height: ${MAP_TOP_OVERLAY_METRICS.searchHeight}px;
`;

export const ProfileImage = styled.Image`
  width: ${MAP_TOP_OVERLAY_METRICS.profileIconSize}px;
  height: ${MAP_TOP_OVERLAY_METRICS.profileIconSize}px;
  border-radius: ${MAP_TOP_OVERLAY_METRICS.profileIconSize / 2}px;
`;

export const CategoryScroll = styled.ScrollView`
  flex-grow: 0;
  margin-top: 0;
  overflow: visible;
`;

export const CategoryContent = styled.View`
  flex-direction: row;
  gap: 8px;
  padding-top: 8px;
  padding-right: 8px;
  padding-bottom: 6px;
  padding-left: 8px;
`;

export const CategoryChipButton = styled.Pressable<{ $active: boolean }>`
  border-width: 1px;
  border-color: ${({ $active }) => ($active ? liquidGlass.category.activeBorder : liquidGlass.category.border)};
  border-radius: 16px;
  background-color: transparent;
`;

export const CategoryChipClip = styled.View`
  border-radius: 15px;
  overflow: hidden;
`;

export const CategoryChipGlass = styled(GlassSurface)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: 15px;
`;

export const CategoryChipContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: ${MAP_TOP_OVERLAY_METRICS.categoryHeight - 2}px;
  gap: 6px;
  padding-right: 11px;
  padding-left: 11px;
  border-radius: 15px;
`;

export const CategoryIconFrame = styled.View`
  align-items: center;
  justify-content: center;
  overflow: visible;
`;

export const CategoryLabel = styled.Text.attrs({ maxFontSizeMultiplier: 1, numberOfLines: 1 })<{ $active: boolean }>`
  color: ${({ $active }) => ($active ? '#FF1956' : '#5E5E66')};
  font-size: ${MAP_TOP_OVERLAY_METRICS.categoryLabelSize}px;
  font-weight: 500;
  line-height: 18.2px;
  letter-spacing: 0px;
`;

export const LocateButtonRow = styled.View`
  align-items: flex-end;
  padding-top: 2px;
  padding-right: 12px;
`;

export const LocateButton = styled.Pressable`
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.9);
  border-radius: 22px;
  background-color: ${liquidGlass.shadowFill};
`;

export const LocateGlass = styled(FrostedSurface)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: 22px;
  overflow: hidden;
`;
