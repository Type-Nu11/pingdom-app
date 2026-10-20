import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import { GlassSurface } from '../../place/map/presentation';

export type AnchoredMenuPosition = { left?: number; right?: number; top: number };

type AnchoredMenuProps = {
  children: React.ReactNode;
  dismissLabel: string;
  onClose: () => void;
  position: AnchoredMenuPosition;
  visible: boolean;
  cornerRadius?: number;
  tintColor?: string;
  testID?: string;
};

export default function AnchoredMenu({ children, dismissLabel, onClose, position, visible, cornerRadius, tintColor, testID }: AnchoredMenuProps) {
  const theme = useTheme();
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [cardHeight, setCardHeight] = useState(0);
  const minTop = insets.top + 8;
  const maxHeight = Math.max(52, height - minTop - insets.bottom - 8);
  const top = Math.max(minTop, Math.min(position.top, height - insets.bottom - 8 - cardHeight));
  const radius = cornerRadius ?? theme.radius.lg;
  return (
    <Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent transparent visible={visible}>
      <Backdrop accessibilityLabel={dismissLabel} accessibilityRole="button" onPress={onClose}>
        <Card
          accessibilityViewIsModal
          onAccessibilityEscape={onClose}
          onLayout={event => setCardHeight(event.nativeEvent.layout.height)}
          onStartShouldSetResponder={() => true}
          testID={testID}
          style={{ boxShadow: theme.liquidGlass.category.shadow, borderRadius: radius,
            width: Math.min(200, width - insets.left - insets.right - 16),
            left: position.left === undefined ? undefined : Math.max(insets.left + 8, Math.min(position.left, width - insets.right - 208)),
            right: position.left === undefined ? Math.max(insets.right + 8, position.right ?? 16) : undefined, top }}
        >
          <Glass glassEffectStyle="regular" tintColor={tintColor} style={{ borderRadius: radius }}>
            <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={{ maxHeight: maxHeight - 16 }}>
              {children}
            </ScrollView>
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
`;

const Glass = styled(GlassSurface)`
  padding: 8px 16px;
  overflow: hidden;
`;
