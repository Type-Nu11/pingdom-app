import { Animated } from 'react-native';
import styled from 'styled-components/native';

import FrostedSurface from '../../presentation/components/FrostedSurface';

export const BottomSheetContainer = styled(Animated.View)`
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 50;
  overflow: visible;
`;

export const SheetChromeShadow = styled(Animated.View)`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  border-radius: ${({ theme }) => theme.liquidGlass.sheet.topRadius}px;
  border-bottom-right-radius: ${({ theme }) => theme.liquidGlass.sheet.bottomRadius}px;
  border-bottom-left-radius: ${({ theme }) => theme.liquidGlass.sheet.bottomRadius}px;
  background-color: ${({ theme }) => theme.liquidGlass.shadowFill};
`;

export const SheetChrome = styled(Animated.View)<{ $borderColor: string }>`
  flex: 1;
  border-width: 1px;
  border-color: ${({ $borderColor }) => $borderColor};
  border-radius: ${({ theme }) => theme.liquidGlass.sheet.topRadius}px;
  border-bottom-right-radius: ${({ theme }) => theme.liquidGlass.sheet.bottomRadius}px;
  border-bottom-left-radius: ${({ theme }) => theme.liquidGlass.sheet.bottomRadius}px;
  overflow: hidden;
`;

export const SheetGlass = styled(FrostedSurface)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: ${({ theme }) => theme.liquidGlass.sheet.topRadius}px;
  border-bottom-right-radius: 0px;
  border-bottom-left-radius: 0px;
  overflow: hidden;
`;

// Figma *-Up frames draw the raised page sheet as a solid Secondary/Assistive surface,
// so this layer fades in over the glass as the sheet approaches its expanded snap.
export const SheetExpandedFill = styled(Animated.View)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: ${({ theme }) => theme.colors.backgroundAssistive};
`;

export const SheetInner = styled.View<{ $clipContent?: boolean; $inset: number; $opaque?: boolean }>`
  flex: 1;
  background-color: ${({ $opaque, theme }) => ($opaque ? theme.colors.background : 'transparent')};
  padding-right: ${({ $inset }) => $inset}px;
  padding-left: ${({ $inset }) => $inset}px;
  overflow: ${({ $clipContent }) => ($clipContent ? 'hidden' : 'visible')};
`;

export const ExpandedPlaceScroll = styled.ScrollView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;
