import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import GlassSurface from '../../presentation/components/GlassSurface';
import { VoiceAssistantScreen, VoiceCommandScreen, type VoiceCommandContext } from '../../../../voice-assistant';

type Props = { visible: boolean; onClose: () => void; context?: VoiceCommandContext };

export default function MapAssistantModal({ visible, onClose, context }: Props) {
  const theme = useTheme();
  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => { onClose(); return true; });
    return () => subscription.remove();
  }, [visible, onClose]);
  if (!visible) return null;
  const sheetBackdrop = <SheetBackdrop tintColor={theme.liquidGlass.sheet.tint} androidTintColor={theme.liquidGlass.sheet.tint} pointerEvents="none" />;
  // Stay in the map's window so keyboard resizing and safe-area coordinates agree.
  return (
    <Overlay testID="map-assistant-modal" accessibilityViewIsModal onAccessibilityEscape={onClose}>
      {context ? <VoiceCommandScreen animateEntrance context={context} onClose={onClose} sheetBackdrop={sheetBackdrop} /> : <VoiceAssistantScreen animateEntrance onClose={onClose} sheetBackdrop={sheetBackdrop} autoStart />}
    </Overlay>
  );
}
const Overlay = styled.View`
  position: absolute;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  z-index: 1000;
  elevation: 1000;
`;
const SheetBackdrop = styled(GlassSurface)`position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;`;
