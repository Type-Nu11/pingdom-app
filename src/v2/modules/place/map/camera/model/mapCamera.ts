// Naver Map uses larger levels for a closer camera.
export const MAP_PREVIEW_ZOOM_LEVEL = 17;
export const MAP_DISMISSED_ZOOM_LEVEL = 15;
export const MAP_LOCATE_ZOOM_LEVEL = 18;

// A display-only starting point when location is unavailable; never sent as user location.
export const DEFAULT_MAP_CENTER = { lat: 37.5665, lng: 126.978 };

type CameraCoordinate = { lat: number; lng: number };

export function selectMapCameraCenter({
  isFollowingUser, focusedPlace, designScale, dismissedMarkerCenter, center,
}: {
  isFollowingUser: boolean;
  focusedPlace: { latitude: number; longitude: number } | null;
  designScale: number;
  dismissedMarkerCenter: CameraCoordinate | null;
  center: CameraCoordinate | null;
}) {
  return {
    lat: !isFollowingUser && focusedPlace
      ? focusedPlace.latitude - (0.00072 * designScale)
      : dismissedMarkerCenter?.lat ?? center?.lat ?? DEFAULT_MAP_CENTER.lat,
    lng: !isFollowingUser && focusedPlace
      ? focusedPlace.longitude
      : dismissedMarkerCenter?.lng ?? center?.lng ?? DEFAULT_MAP_CENTER.lng,
  };
}
