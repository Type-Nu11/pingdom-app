import { create } from 'zustand';

import type { BottomSheetSnapPoint } from '../hooks/useBottomSheet';

// The bottom-navigation pages share one sheet, so a raised sheet stays raised when the
// user moves between pages or comes back to a remounted map screen.
type MapSheetStore = {
  snapPoint: BottomSheetSnapPoint;
  setSnapPoint: (snapPoint: BottomSheetSnapPoint) => void;
};

export const useMapSheetStore = create<MapSheetStore>((set) => ({
  snapPoint: 'medium',
  setSnapPoint: (snapPoint) => set({ snapPoint }),
}));

/** Pages open at the shared resting height unless the sheet was already raised. */
export const getPageEntrySnapPoint = (current: BottomSheetSnapPoint): BottomSheetSnapPoint => (
  current === 'expanded' ? 'expanded' : 'medium'
);
