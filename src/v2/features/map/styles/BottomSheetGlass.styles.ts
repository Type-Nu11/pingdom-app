import { Animated } from 'react-native';
import styled from 'styled-components/native';

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
  border-radius: 34px;
  border-bottom-right-radius: 48px;
  border-bottom-left-radius: 48px;
  background-color: rgba(244, 246, 248, 0.08);
  elevation: 8;
  shadow-color: #10141A;
  shadow-offset: 0px -3px;
  shadow-opacity: 0.08;
  shadow-radius: 14px;
`;

export const SheetChrome = styled(Animated.View)<{ $borderColor: string }>`
  flex: 1;
  border-width: 1px;
  border-color: ${({ $borderColor }) => $borderColor};
  border-radius: 34px;
  border-bottom-right-radius: 48px;
  border-bottom-left-radius: 48px;
  overflow: hidden;
`;

export const SheetGlass = styled(FrostedSurface)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: 34px;
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
