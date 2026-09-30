import React from 'react';
import { Modal, Pressable } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import { GlassSurface } from '../../place/map/presentation';

export type AnchoredMenuPosition = { left?: number; right?: number; top: number };

type AnchoredMenuProps = {
  children: React.ReactNode;
  dismissLabel: string;
  onClose: () => void;
  position: AnchoredMenuPosition;
  visible: boolean;
};

export default function AnchoredMenu({ children, dismissLabel, onClose, position, visible }: AnchoredMenuProps) {
  const theme = useTheme();
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <Backdrop accessibilityLabel={dismissLabel} accessibilityRole="button" onPress={onClose}>
        <Card
          onStartShouldSetResponder={() => true}
          style={{ boxShadow: theme.liquidGlass.category.shadow, left: position.left, right: position.right, top: position.top }}
        >
          <Glass glassEffectStyle="regular">
            {children}
          </Glass>
        </Card>
      </Backdrop>
    </Modal>
  );
}

const Backdrop = styled(Pressable)`
  flex: 1;
`;

// Figma `alert`: a 200px frosted card with 8px/16px padding and the
// `Shadow/Float` elevation shared with the map glass chips.
const Card = styled.View`
  position: absolute;
  width: 200px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
`;

const Glass = styled(GlassSurface)`
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  overflow: hidden;
`;
