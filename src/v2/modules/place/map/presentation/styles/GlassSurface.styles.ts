import styled from 'styled-components/native';
import { BlurView } from 'expo-blur';

export const GlassContainer = styled.View`
  overflow: hidden;
`;

export const GlassBlur = styled(BlurView)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

export const GlassTint = styled.View<{ $backgroundColor: string }>`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: ${({ $backgroundColor }) => $backgroundColor};
`;
