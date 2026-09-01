import { Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import FrostedSurface from '../components/FrostedSurface';

const IOS = Platform.OS === 'ios';

export const MAP_TOP_OVERLAY_METRICS = {
  categoryHeight: 38,
  categoryIconHeight: 18,
  categoryIconWidth: 19,
  categoryLabelSize: 14,
  headerHeight: 62,
  profileIconSize: 38,
  searchHeight: 48,
  searchIconSize: 22,
  searchLabelSize: 17,
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
  padding-right: 10px;
  padding-left: 10px;
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
  border-radius: 31px;
  background-color: ${IOS ? 'rgba(248,248,248,0.16)' : 'rgba(248,248,248,0.01)'};
`;

export const HeaderSurface = styled.View`
  flex-direction: row;
  align-items: center;
  height: ${MAP_TOP_OVERLAY_METRICS.headerHeight}px;
  gap: 8px;
  padding: 7px;
  border-radius: 31px;
  overflow: hidden;
`;

export const HeaderGlass = styled(FrostedSurface)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: 31px;
`;

export const SearchShadow = styled.View`
  flex: 1;
  height: ${MAP_TOP_OVERLAY_METRICS.searchHeight}px;
  border-radius: 24px;
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
  border-radius: 24px;
  overflow: hidden;
`;

export const SearchContent = styled.Pressable`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding-right: 14px;
  padding-left: 14px;
`;

export const SearchInput = styled.Text.attrs({ maxFontSizeMultiplier: 1 })<{ $isPlaceholder: boolean }>`
  flex: 1;
  color: ${({ $isPlaceholder }) => ($isPlaceholder ? '#5E6069' : '#1D1E23')};
  font-size: ${MAP_TOP_OVERLAY_METRICS.searchLabelSize}px;
  font-weight: 400;
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
  overflow: hidden;
`;

export const CategoryContent = styled.View`
  flex-direction: row;
  gap: 8px;
  padding-top: 5px;
  padding-right: 10px;
  padding-bottom: 6px;
  padding-left: 10px;
`;

export const CategoryChipButton = styled.Pressable<{ $active: boolean }>`
  border-width: 1px;
  border-color: ${({ $active }) => ($active ? 'rgba(255,74,117,0.88)' : 'rgba(228,228,229,0.85)')};
  border-radius: 19px;
  background-color: ${({ $active }) => ($active
    ? 'rgba(255,201,211,0.24)'
    : (IOS ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.01)'))};
`;

export const CategoryChipClip = styled.View`
  border-radius: 19px;
  overflow: hidden;
`;

export const CategoryChipGlass = styled(FrostedSurface)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: 19px;
`;

export const CategoryChipContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: ${MAP_TOP_OVERLAY_METRICS.categoryHeight}px;
  gap: 6px;
  padding-right: 14px;
  padding-left: 14px;
  border-radius: 19px;
`;

export const CategoryLabel = styled.Text.attrs({ maxFontSizeMultiplier: 1 })<{ $active: boolean }>`
  color: ${({ $active }) => ($active ? '#FF245B' : '#5E5E66')};
  font-size: ${MAP_TOP_OVERLAY_METRICS.categoryLabelSize}px;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  line-height: 20px;
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
  background-color: rgba(255, 255, 255, 0.94);
  elevation: 3;
  shadow-color: #10141a;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.12;
  shadow-radius: 6px;
`;
