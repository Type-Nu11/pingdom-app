import React, { type PropsWithChildren } from 'react';
import { Modal } from 'react-native';
import styled from 'styled-components/native';

/** Native Modal is only the window host; every visible surface uses PingDom tokens. */
export default function AppModal({ children, visible, onClose, onDismiss, dismissLabel, testID, menuPosition }: PropsWithChildren<{
  menuPosition?: { left: number; top: number; width: number };
  visible: boolean; onClose: () => void; onDismiss?: () => void; dismissLabel: string; testID?: string;
}>) {
  return <Modal transparent visible={visible} animationType="fade" statusBarTranslucent
    navigationBarTranslucent onRequestClose={onClose} onDismiss={onDismiss} testID={testID ? `${testID}-host` : undefined}>
    <Overlay>
      <Backdrop $menu={!!menuPosition} accessibilityRole="button" accessibilityLabel={dismissLabel} onPress={onClose} />
      {menuPosition ? <MenuCard accessibilityViewIsModal onAccessibilityEscape={onClose} testID={testID}
        style={{ left: menuPosition.left, top: menuPosition.top, width: menuPosition.width }}>
        {children}
      </MenuCard> : <Card accessibilityViewIsModal onAccessibilityEscape={onClose} testID={testID}>
        {children}
      </Card>}
    </Overlay>
  </Modal>;
}
const Overlay = styled.View`flex: 1; justify-content: center; padding: 24px;`;
const Backdrop = styled.Pressable<{ $menu: boolean }>`
  position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;
  background-color: ${({ theme, $menu }) => $menu ? 'transparent' : theme.colors.overlay};
`;
const Card = styled.View.attrs(({ theme }) => ({ style: { boxShadow: theme.liquidGlass.sheet.shadow } }))`
  width: 100%; max-width: 400px; max-height: 85%; align-self: center;
  padding: 24px; gap: 18px; border-radius: ${({ theme }) => theme.liquidGlass.sheet.topRadius}px; border-width: 1px;
  border-color: ${({ theme }) => theme.liquidGlass.sheet.rim};
  background-color: ${({ theme }) => theme.colors.surface};
  overflow: hidden;
`;

// Figma 10250:35426; this common host keeps menu surfaces out of clipped sheets.
const MenuCard = styled.View.attrs(({ theme }) => ({
  style: { boxShadow: `0px 4px 20px 0px ${theme.colors.shadowFloat}` },
}))`
  position: absolute; padding: 8px 16px; gap: 6px; border-radius: 24px; overflow: hidden;
  background-color: ${({ theme }) => theme.colorScheme === 'dark' ? 'rgba(28,28,30,0.88)' : 'rgba(255,255,255,0.88)'};
`;
