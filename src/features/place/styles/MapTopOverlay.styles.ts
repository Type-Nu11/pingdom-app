import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import GlassSurface from '../components/GlassSurface';

const IOS = Platform.OS === 'ios';

export const SafeOverlay = styled(SafeAreaView)`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 40;
  padding-top: ${Platform.OS === 'android' ? 6 : 2}px;
`;

export const Header = styled.View`
  padding-right: 8px;
  padding-left: 8px;
`;

export const HeaderShadow = styled.View`
  border-radius: 29px;
  background-color: ${IOS ? 'rgba(248,248,248,0.16)' : 'rgba(248,248,248,0.01)'};
  elevation: 6;
  shadow-color: #000000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.15;
  shadow-radius: 10px;
`;

export const HeaderSurface = styled.View`
  flex-direction: row;
  align-items: center;
  height: 60px;
  gap: 16px;
  padding: 8px;
  border-radius: 29px;
  overflow: hidden;
`;

export const HeaderGlass = styled(GlassSurface)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: 29px;
`;

export const SearchShadow = styled.View`
  flex: 1;
  height: 44px;
  border-radius: 26px;
  background-color: transparent;
  overflow: hidden;
`;

export const SearchGlass = styled(GlassSurface)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  align-items: center;
  border-radius: 26px;
  box-shadow: inset 0px 4px 20px rgba(0, 0, 0, 0.1);
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
  gap: 12px;
  padding-right: 12px;
  padding-left: 12px;
`;

export const SearchInput = styled.Text<{ $isPlaceholder: boolean }>`
  flex: 1;
  color: ${({ $isPlaceholder }) => ($isPlaceholder ? '#5E6069' : '#1D1E23')};
  font-size: 16px;
  font-weight: 400;
  line-height: 21px;
`;

export const ProfileButton = styled.Pressable`
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
`;

export const CategoryScroll = styled.ScrollView`
  flex-grow: 0;
  margin-top: 3px;
  overflow: hidden;
`;

export const CategoryContent = styled.View`
  flex-direction: row;
  gap: 8px;
  padding-top: 5px;
  padding-right: 12px;
  padding-bottom: 5px;
  padding-left: 12px;
`;

export const CategoryChipButton = styled.Pressable`
  border-radius: 16px;
  background-color: ${IOS ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.01)'};
  elevation: 2;
  shadow-color: #000000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.12;
  shadow-radius: 10px;
`;

export const CategoryChipClip = styled.View`
  border-radius: 16px;
  overflow: hidden;
`;

export const CategoryChipGlass = styled(GlassSurface)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: 16px;
`;

export const CategoryChipContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 34px;
  gap: 6px;
  padding-right: 12px;
  padding-left: 12px;
  border-radius: 16px;
`;

export const CategoryLabel = styled.Text<{ $active: boolean }>`
  color: ${({ $active }) => ($active ? '#FF245B' : '#5E5E66')};
  font-size: 14px;
  font-weight: 500;
  line-height: 18px;
`;

export const CategoryChipStroke = styled.View<{ $active: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-width: 1px;
  border-color: ${({ $active }) => ($active ? 'rgba(255,74,117,0.96)' : 'rgba(255,255,255,0.92)')};
  border-radius: 16px;
`;
