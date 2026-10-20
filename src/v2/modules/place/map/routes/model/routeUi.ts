export type RouteMode = 'car' | 'walk' | 'transit' | 'bike';
export type RouteDestination = {
  isCurrentLocation?: boolean;
  category?: import('../../../../../shared/native/NaverMapNativeView').NaverMapNativeMarker['category'];
  placeId: number;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export function hasRouteDestinationCoordinates(value: unknown): value is { latitude: number; longitude: number } {
  if (!value || typeof value !== 'object') return false;
  const { latitude, longitude } = value as Record<string, unknown>;
  return typeof latitude === 'number' && Number.isFinite(latitude) && Math.abs(latitude) <= 90
    && typeof longitude === 'number' && Number.isFinite(longitude) && Math.abs(longitude) <= 180;
}
