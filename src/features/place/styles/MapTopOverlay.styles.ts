import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import FrostedSurface from '../components/FrostedSurface';

const IOS = Platform.OS === 'ios';

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

export const HeaderShadow = styled.View`
  border-radius: 25px;
  background-color: ${IOS ? 'rgba(248,248,248,0.16)' : 'rgba(248,248,248,0.01)'};
`;

export const HeaderSurface = styled.View`
  flex-direction: row;
  align-items: center;
  height: 50px;
  gap: 8px;
  padding: 6px;
  border-radius: 25px;
  overflow: hidden;
`;

export const HeaderGlass = styled(FrostedSurface)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: 25px;
`;

export const SearchShadow = styled.View`
  flex: 1;
  height: 38px;
  border-radius: 20px;
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
  border-radius: 20px;
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
  padding-right: 10px;
  padding-left: 10px;
`;

export const SearchInput = styled.Text.attrs({ maxFontSizeMultiplier: 1 })<{ $isPlaceholder: boolean }>`
  flex: 1;
  color: ${({ $isPlaceholder }) => ($isPlaceholder ? '#5E6069' : '#1D1E23')};
  font-size: 14px;
  font-weight: 400;
  line-height: 18px;
`;

export const ProfileButton = styled.Pressable`
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
`;

export const CategoryScroll = styled.ScrollView`
  flex-grow: 0;
  margin-top: 0;
  overflow: hidden;
`;

export const CategoryContent = styled.View`
  flex-direction: row;
  gap: 6px;
  padding-top: 3px;
  padding-right: 10px;
  padding-bottom: 4px;
  padding-left: 10px;
`;

export const CategoryChipButton = styled.Pressable<{ $active: boolean }>`
  border-width: 1px;
  border-color: ${({ $active }) => ($active ? 'rgba(255,74,117,0.88)' : 'transparent')};
  border-radius: 15px;
  background-color: ${({ $active }) => ($active
    ? 'rgba(255,201,211,0.24)'
    : (IOS ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.01)'))};
  elevation: 1;
  shadow-color: #000000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.06;
  shadow-radius: 4px;
`;

export const CategoryChipClip = styled.View`
  border-radius: 15px;
  overflow: hidden;
`;

export const CategoryChipGlass = styled(FrostedSurface)`
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
  height: 30px;
  gap: 5px;
  padding-right: 10px;
  padding-left: 10px;
  border-radius: 15px;
`;

export const CategoryLabel = styled.Text.attrs({ maxFontSizeMultiplier: 1 })<{ $active: boolean }>`
  color: ${({ $active }) => ($active ? '#FF245B' : '#5E5E66')};
  font-size: 12px;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  line-height: 16px;
`;
