import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import styled from 'styled-components/native';
import { VoiceAssistantScreen, VoiceCommandScreen, type VoiceCommandContext } from '../../../../voice-assistant';

type Props = { visible: boolean; onClose: () => void; context?: VoiceCommandContext };

export default function MapAssistantModal({ visible, onClose, context }: Props) {
  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => { onClose(); return true; });
    return () => subscription.remove();
  }, [visible, onClose]);
  if (!visible) return null;
  // Stay in the map's window so keyboard resizing and safe-area coordinates agree.
  return (
    <Overlay testID="map-assistant-modal" accessibilityViewIsModal onAccessibilityEscape={onClose}>
      {context ? <VoiceCommandScreen context={context} onClose={onClose} /> : <VoiceAssistantScreen onClose={onClose} autoStart />}
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
