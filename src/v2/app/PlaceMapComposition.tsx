import React, { type PropsWithChildren } from 'react';
import { MapCommunitySheetProvider, MapReservationSheetProvider } from '../modules/place/map/sheet';
import { ReservationBottomSheet } from '../modules/booking/reservations/map-sheet';
import { CommunityBottomSheet } from '../modules/community';

/** #359 retains Booking's sheet implementation; only app selects the implementation. */
export function PlaceMapComposition({ children }: PropsWithChildren) {
  return (
    <MapReservationSheetProvider value={ReservationBottomSheet}>
      <MapCommunitySheetProvider value={CommunityBottomSheet}>
        {children}
      </MapCommunitySheetProvider>
    </MapReservationSheetProvider>
  );
}
