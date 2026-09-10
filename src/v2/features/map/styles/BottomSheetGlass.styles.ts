import { Animated } from 'react-native';
import styled from 'styled-components/native';

import { liquidGlass } from '../../../shared/theme/liquidGlass';
import FrostedSurface from '../components/FrostedSurface';

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
  border-radius: ${liquidGlass.sheet.topRadius}px;
  border-bottom-right-radius: ${liquidGlass.sheet.bottomRadius}px;
  border-bottom-left-radius: ${liquidGlass.sheet.bottomRadius}px;
  background-color: ${liquidGlass.shadowFill};
`;

export const SheetChrome = styled(Animated.View)<{ $borderColor: string }>`
  flex: 1;
  border-width: 1px;
  border-color: ${({ $borderColor }) => $borderColor};
  border-radius: ${liquidGlass.sheet.topRadius}px;
  border-bottom-right-radius: ${liquidGlass.sheet.bottomRadius}px;
  border-bottom-left-radius: ${liquidGlass.sheet.bottomRadius}px;
  overflow: hidden;
`;

export const SheetGlass = styled(FrostedSurface)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: ${liquidGlass.sheet.topRadius}px;
  border-bottom-right-radius: 0px;
  border-bottom-left-radius: 0px;
  overflow: hidden;
`;

export const SheetInner = styled.View<{ $clipContent?: boolean; $inset: number }>`
  flex: 1;
  padding-right: ${({ $inset }) => $inset}px;
  padding-left: ${({ $inset }) => $inset}px;
  overflow: ${({ $clipContent }) => ($clipContent ? 'hidden' : 'visible')};
`;
