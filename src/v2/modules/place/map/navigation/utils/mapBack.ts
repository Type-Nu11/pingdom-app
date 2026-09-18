import type { BottomSheetSnapPoint } from '../../sheet/hooks/useBottomSheet';
import type { BottomSheetContent } from '../../sheet/components/MapBottomSheet';

export type MapBackAction = 'show-home' | 'collapse-sheet' | 'navigate-back';

export function getMapBackAction(
  content: BottomSheetContent,
  snapPoint: BottomSheetSnapPoint,
): MapBackAction {
  if (content.type !== 'home') {
    return 'show-home';
  }

  if (snapPoint !== 'collapsed') {
    return 'collapse-sheet';
  }

  return 'navigate-back';
}
