import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';
import FrostedSurface from '../../presentation/components/FrostedSurface';
import PingdyAsset from '../assets/map_pingdy.svg';
import PingdyPressedAsset from '../assets/map_pingdy_pressed.svg';

type Props = { disabled?: boolean; onPress: () => void };

export default function MapAssistantButton({ disabled = false, onPress }: Props) {
  const [pressed, setPressed] = React.useState(false);
  const Artwork = pressed && !disabled ? PingdyPressedAsset : PingdyAsset;
  const { t } = useTranslation();
  const { colors, liquidGlass } = useTheme();
  return (
    <Button accessibilityLabel={t('voiceAssistant.open')} accessibilityRole="button"
      accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
      onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)}
      testID="map-assistant-button" style={{ opacity: disabled ? 0.72 : 1 }}>
      <Glass bottomShade={false} cornerRadius={22} glassEffectStyle="regular"
        pointerEvents="none" highlightOpacity={liquidGlass.navigation.highlightOpacity}
        rimColor={liquidGlass.navigation.rim} tintColor={liquidGlass.navigation.softTint} />
      {/* Figma 10018:40595: 44 dp circle at (20,16) within the 84 dp shadow viewport. */}
      {/* The circle takes the themed surface and the glyph Label/Neutral, so both states flip in dark. */}
      <Artwork width={84} height={84} color={colors.labelNeutral} fill={colors.surfaceElevated}
        pointerEvents="none" style={{ position: 'absolute', left: -20, top: -16 }}
        testID={pressed && !disabled ? "map-assistant-button-pressed-artwork" : "map-assistant-button-artwork"} />
    </Button>
  );
}

const Button = styled.Pressable`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  overflow: visible;
`;

const Glass = styled(FrostedSurface)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: 22px;
  overflow: hidden;
`;
