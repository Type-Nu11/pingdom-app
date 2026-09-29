import { Animated } from 'react-native';
import styled from 'styled-components/native';
import { Text } from '../../../../shared/components/Typography';
import GlassSurface from '../presentation/components/GlassSurface';

export const Overlay = styled.View`
  position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;
  z-index: 1002; elevation: 1002;
`;
export const TouchBlocker = styled.Pressable`
  position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;
`;
export const CardPositioner = styled.View`
  position: absolute; justify-content: center;
`;
export const CardShadow = styled(Animated.View)`
  border-radius: 24px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.12);
`;
export const Card = styled(GlassSurface)`border-radius: 24px; overflow: hidden;`;
export const Progress = styled.View`
  height: 19px; flex-direction: row; gap: 6px; align-items: center; justify-content: center;
`;
export const Dot = styled.View`height: 7px; border-radius: 100px;`;
export const Content = styled.View`gap: 20px;`;
export const Header = styled.View`
  flex-direction: row; justify-content: space-between; align-items: center; height: 32px;
`;
export const HeaderControls = styled.View`flex-direction: row; align-items: center; gap: 16px;`;
export const Identity = styled.View`flex-direction: row; align-items: center; gap: 8px;`;
export const Title = styled(Text)`font-size: 18px; font-weight: 700; line-height: 23.4px; include-font-padding: false;`;
export const Body = styled(Text)`font-size: 16px; font-weight: 500; line-height: 21px; include-font-padding: false;`;
export const Accent = styled(Body)`font-weight: 700;`;
export const Welcome = styled.View`gap: 20px;`;
export const Lines = styled.View`gap: 4px;`;
export const CloseButton = styled.Pressable`
  width: 32px; height: 32px; border-radius: 32px; align-items: center; justify-content: center;
  background-color: ${({ theme }) => theme.colorScheme === 'dark' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.56)'}; box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.06);
`;
export const Actions = styled.View`flex-direction: row; justify-content: space-between;`;
export const Arrow = styled.Pressable`
  width: 32px; height: 32px; border-radius: 16px;
  background-color: ${({ theme }) => theme.colorScheme === 'dark' ? '#FFFFFF' : 'transparent'};
`;
export const ArrowSpace = styled.View`width: 32px; height: 32px;`;
export const ArrowAsset = styled.View`
  position: absolute; left: -20px; top: -16px; width: 72px; height: 72px;
`;
