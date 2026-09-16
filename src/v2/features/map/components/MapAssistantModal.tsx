import React from 'react';
import { Modal } from 'react-native';
import { VoiceAssistantScreen } from '../../voice-assistant';

type Props = { visible: boolean; onClose: () => void };

export default function MapAssistantModal({ visible, onClose }: Props) {
  // Unmounting the input screen cancels its session and discards draft/listeners.
  if (!visible) return null;
  return (
    <Modal testID="map-assistant-modal" visible animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <VoiceAssistantScreen onClose={onClose} />
    </Modal>
  );
}
