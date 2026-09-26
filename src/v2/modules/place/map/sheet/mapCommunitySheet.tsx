import { createContext, useContext, type ComponentType } from 'react';
import type { Animated, GestureResponderHandlers } from 'react-native';
import type { BottomSheetSnapPoint } from './hooks/useBottomSheet';

export type MapCommunitySheetProps = {
  collapsedTranslateY: number;
  height: number;
  mediumTranslateY: number;
  onHandlePress: () => void;
  onOpenMap: () => void;
  onOpenPost: (postId: number) => void;
  onOpenRecommendations?: () => void;
  onOpenReservations?: () => void;
  onOpenWrite: (categoryId?: string) => void;
  panHandlers: GestureResponderHandlers;
  sheetChromeBottom: Animated.Value;
  sheetTranslateY: Animated.Value;
  snapPoint: BottomSheetSnapPoint;
};

const MapCommunitySheetContext = createContext<ComponentType<MapCommunitySheetProps> | null>(null);
export const MapCommunitySheetProvider = MapCommunitySheetContext.Provider;
export function useMapCommunitySheet() {
  const Sheet = useContext(MapCommunitySheetContext);
  if (!Sheet) throw new Error('Map community sheet must be composed by the app provider.');
  return Sheet;
}
