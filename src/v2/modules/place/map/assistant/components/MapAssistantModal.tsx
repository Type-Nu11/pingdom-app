import React from 'react';
import { Modal } from 'react-native';
import { VoiceAssistantScreen, VoiceCommandScreen, type VoiceCommandContext } from '../../../../voice-assistant';

type Props = { visible: boolean; onClose: () => void; context?: VoiceCommandContext };

export default function MapAssistantModal({ visible, onClose, context }: Props) {
  // Unmounting the input screen cancels its session and discards draft/listeners.
  if (!visible) return null;
  return (
    <Modal testID="map-assistant-modal" visible animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      {context ? <VoiceCommandScreen context={context} onClose={onClose} /> : <VoiceAssistantScreen onClose={onClose} />}
    </Modal>
  );
}
