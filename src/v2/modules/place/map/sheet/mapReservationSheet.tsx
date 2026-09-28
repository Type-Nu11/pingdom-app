import { createContext, useContext, type ComponentType } from 'react';
import type { Animated, GestureResponderHandlers } from 'react-native';
import type { BottomSheetSnapPoint } from './hooks/useBottomSheet';
import type { DecisionPlace } from './components/MapBottomSheet';

export type MapReservationSheetProps = {
  bookmarkedPlaceIds: Record<string, boolean>;
  bookmarkPendingPlaceIds: Record<string, boolean>;
  collapsedTranslateY: number;
  height: number;
  isBookmarkStateLoading: boolean;
  isNearbyLoading?: boolean;
  nearbyError?: unknown;
  nearbyBusy?: boolean;
  onRetryNearby?: () => unknown;
  mediumTranslateY: number;
  nearbyPlaces: DecisionPlace[];
  reservationPlaceByAvailabilityId: Record<string, DecisionPlace>;
  onHandlePress: () => void;
  onOpenCommunity: () => void;
  onOpenFavorites: () => void;
  onOpenMap: () => void;
  onOpenRecommendations: () => void;
  onOpenReservation: (reservationId: number) => void;
  onPlacePress: (place: DecisionPlace) => void;
  onToggleBookmark: (place: DecisionPlace, nextBookmarked: boolean) => Promise<void>;
  panHandlers: GestureResponderHandlers;
  sheetChromeBottom: Animated.Value;
  sheetTranslateY: Animated.Value;
  snapPoint: BottomSheetSnapPoint;
};

const MapReservationSheetContext = createContext<ComponentType<MapReservationSheetProps> | null>(null);
export const MapReservationSheetProvider = MapReservationSheetContext.Provider;
export function useMapReservationSheet() {
  const Sheet = useContext(MapReservationSheetContext);
  if (!Sheet) throw new Error('Map reservation sheet must be composed by the app provider.');
  return Sheet;
}
