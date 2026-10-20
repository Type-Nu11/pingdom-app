import { usePlaceDetail } from '../../../place/detail';

/** Place keeps its query/cache ownership; Booking consumes the existing summary unchanged. */
export function useReservationPlaceSummary(placeId: number) {
  return usePlaceDetail(placeId);
}
