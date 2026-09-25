import React from 'react';
import { Modal, Pressable } from 'react-native';
import styled from 'styled-components/native';

export type AnchoredMenuPosition = { left?: number; right?: number; top: number };

type AnchoredMenuProps = {
  children: React.ReactNode;
  dismissLabel: string;
  onClose: () => void;
  position: AnchoredMenuPosition;
  visible: boolean;
};

export default function AnchoredMenu({ children, dismissLabel, onClose, position, visible }: AnchoredMenuProps) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <Backdrop accessibilityLabel={dismissLabel} accessibilityRole="button" onPress={onClose}>
        <Card
          onStartShouldSetResponder={() => true}
          style={{ left: position.left, right: position.right, top: position.top }}
        >
          {children}
        </Card>
      </Backdrop>
    </Modal>
  );
}

const Backdrop = styled(Pressable)`
  flex: 1;
`;

const Card = styled.View`
  position: absolute;
  min-width: 168px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: rgba(255, 255, 255, 0.96);
  box-shadow: 0px 4px 20px 0px ${({ theme }) => theme.colors.shadow};
  overflow: hidden;
`;
