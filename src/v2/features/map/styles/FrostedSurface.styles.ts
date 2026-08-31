import styled from 'styled-components/native';
import Svg from 'react-native-svg';

export const HighlightGradient = styled(Svg)<{ $height?: number }>`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: ${({ $height }) => ($height ? `${$height}px` : '100%')};
`;

export const Rim = styled.View<{ $color: string }>`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-width: 1px;
  border-color: ${({ $color }) => $color};
`;

export const TopRim = styled.View<{ $color: string }>`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 1px;
  background-color: ${({ $color }) => $color};
`;

export const BottomShade = styled.View`
  position: absolute;
  right: 1px;
  bottom: 0;
  left: 1px;
  height: 1px;
  background-color: rgba(20, 24, 32, 0.08);
`;
