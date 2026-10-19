import React, { useEffect, useRef, useState } from 'react';
import { View, useWindowDimensions, type GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';
import AppModal from './AppModal';
import { useAppDialog } from './AppDialogProvider';
import { Text } from './Typography';
import { textStyleCss } from '../theme/typography';
import EditIcon from '../assets/icons/content-actions/edit.svg';
import TrashIcon from '../assets/icons/content-actions/trash.svg';
import MoreIcon from '../assets/icons/content-actions/more.svg';

type Anchor = { x: number; y: number; width: number; height: number };

/** UI for author-owned content. Missing server actions explicitly report unavailability. */
export default function OwnerContentActions({ onEdit, onDelete, busy = false, canEdit = true, compact = false }: {
  onEdit?: () => void; onDelete?: () => void; busy?: boolean; canEdit?: boolean; compact?: boolean;
}) {
  const { t } = useTranslation();
  const dialog = useAppDialog();
  const trigger = useRef<View>(null);
  const generation = useRef(0);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // Invalidate measurement callbacks when a row unmounts or the viewport changes.
  useEffect(() => {
    generation.current += 1;
    setAnchor(null);
    return () => { generation.current += 1; };
  }, [width, height, insets.top, insets.bottom, insets.left, insets.right]);
  const menuWidth = Math.min(200, Math.max(1, width - insets.left - insets.right - 16));
  const close = () => { generation.current += 1; setAnchor(null); };
  const open = (event?: GestureResponderEvent) => {
    event?.stopPropagation();
    if (busy) return;
    const request = ++generation.current;
    // measure's page coordinates share the full React root with our
    // translucent-status-bar Modal. Android measureInWindow subtracts the
    // status bar, which otherwise lifts the menu over its own trigger.
    trigger.current?.measure((_localX, _localY, measuredWidth, measuredHeight, x, y) => {
      if (request === generation.current) setAnchor({ x, y, width: measuredWidth, height: measuredHeight });
    });
  };
  const act = (action?: () => void) => {
    close();
    if (action) action();
    else dialog.toast(t('contentActions.unavailable'));
  };
  const menuHeight = canEdit ? 126 : 68;
  const gap = 8;
  // Window-hosted menu: align below the glyph with 8px breathing room, then
  // flip above only when the whole menu cannot fit in the safe viewport.
  const top = anchor ? Math.max(insets.top + 8, Math.min(
    anchor.y + anchor.height + gap + menuHeight <= height - insets.bottom - 8
      ? anchor.y + anchor.height + gap : anchor.y - gap - menuHeight,
    height - insets.bottom - menuHeight - 8,
  )) : 0;
  return <>
    <Trigger $compact={compact} hitSlop={compact ? 10 : undefined} ref={trigger} collapsable={false} accessibilityRole="button"
      accessibilityLabel={t('contentActions.more')} disabled={busy} accessibilityState={{ expanded: !!anchor, busy }}
      onPress={open} testID="owner-content-more">
      <Glyph><MoreIcon /></Glyph>
    </Trigger>
    <AppModal visible={!!anchor} onClose={close} dismissLabel={t('contentActions.close')}
      testID="owner-content-menu" menuPosition={{ width: menuWidth, top,
        left: Math.max(insets.left + 8, Math.min((anchor?.x ?? 0) + (anchor?.width ?? 44) + (compact ? 8 : -2) - menuWidth,
          width - insets.right - 8 - menuWidth)) }}>
      {canEdit ? <Row accessibilityRole="button" onPress={event => { event?.stopPropagation(); act(onEdit); }} testID="owner-content-edit">
        <Glyph><EditIcon /></Glyph><Label>{t('contentActions.edit')}</Label>
      </Row> : null}
      <DeleteRow accessibilityRole="button" onPress={event => { event?.stopPropagation(); act(onDelete); }} testID="owner-content-delete">
        <TrashIcon /><DangerLabel>{t('contentActions.delete')}</DangerLabel>
      </DeleteRow>
    </AppModal>
  </>;
}
const Trigger = styled.Pressable<{ $compact: boolean }>`width: ${({ $compact }) => $compact ? 24 : 44}px; height: ${({ $compact }) => $compact ? 24 : 44}px; flex-shrink: 0; align-items: center; justify-content: center;`;
const Glyph = styled.View.attrs(({ theme }) => ({ style: { filter: [{ brightness: theme.colorScheme === 'dark' ? 3 : 1 }] } }))`
  width: 24px; height: 24px; align-items: center; justify-content: center;
`;
const Row = styled.Pressable`height: 52px; flex-direction: row; align-items: center; padding: 0 8px; gap: 4px;`;
const DeleteRow = styled(Row)`border-top-width: 1px; border-top-color: ${({ theme }) => theme.colors.secondaryAlternative};`;
const Label = styled(Text)`flex: 1; min-width: 0; color: ${({ theme }) => theme.colors.labelNeutral}; ${({ theme }) => textStyleCss(theme.typography.bodyMedium)}`;
const DangerLabel = styled(Label)`color: ${({ theme }) => theme.colors.danger};`;
