import type { BottomSheetSnapPoint } from '../hooks/useBottomSheet';
import type { BottomSheetContent } from '../components/MapBottomSheet';

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
