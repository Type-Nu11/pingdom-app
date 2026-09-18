import React, { type PropsWithChildren } from 'react';
import { MapReservationSheetProvider } from '../modules/place/map/sheet';
import { ReservationBottomSheet } from '../modules/booking/reservations/map-sheet';

/** #359 retains Booking's sheet implementation; only app selects the implementation. */
export function PlaceMapComposition({ children }: PropsWithChildren) {
  return <MapReservationSheetProvider value={ReservationBottomSheet}>{children}</MapReservationSheetProvider>;
}
