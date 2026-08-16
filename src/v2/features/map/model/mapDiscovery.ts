import type {
  MapViewport,
  PlaceAutocomplete,
  PlaceCard,
  PlaceList,
  PlaceOperatingNotices,
  PlaceVisitDecision,
} from '../../place-exploration';
import type { Coordinate, MapMarker, MapMarkerCategory } from './map.types';

export type MapPlaceMarker = MapMarker & {
  kind: 'cluster' | 'place';
  placeId: number | null;
};

export type MapPlaceResult = {
  address: string;
  category: string;
  coordinate: Coordinate;
  distanceMeters: number | null;
  id: number;
  name: string;
};

export type MapPlaceCardViewModel = {
  address: string;
  category: string;
  currentlyOperating: boolean | null;
  id: number;
  name: string;
  notice: string | null;
  summary: string | null;
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const text = (value: unknown, fallback = '') =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback;

export function toMarkerCategory(value: unknown): MapMarkerCategory {
  const category = text(value).toUpperCase();
  if (category.includes('FASHION') || category.includes('BEAUTY')) return 'fashion';
  if (category.includes('FOOD') || category.includes('CAFE')) return 'food';
  if (category.includes('MUSIC') || category.includes('K_POP')) return 'music';
  if (category.includes('GAME')) return 'game';
  return 'etc';
}

export function createViewport(
  center: Coordinate,
  radiusKm: number,
  zoom: number,
) {
  const safeRadius = Math.min(20, Math.max(0.1, radiusKm));
  const latitudeDelta = safeRadius / 111.32;
  const longitudeScale = Math.max(Math.cos((center.lat * Math.PI) / 180), 0.01);
  const longitudeDelta = safeRadius / (111.32 * longitudeScale);
  const round = (value: number) => Number(value.toFixed(6));

  return {
    west: round(Math.max(-180, center.lng - longitudeDelta)),
    south: round(Math.max(-90, center.lat - latitudeDelta)),
    east: round(Math.min(180, center.lng + longitudeDelta)),
    north: round(Math.min(90, center.lat + latitudeDelta)),
    zoom: Math.min(20, Math.max(0, Math.round(zoom))),
  };
}

export function toViewportMarkers(viewport: MapViewport | undefined): MapPlaceMarker[] {
  const markers = Array.isArray(viewport?.markers) ? viewport.markers : [];
  const clusters = Array.isArray(viewport?.clusters) ? viewport.clusters : [];

  return [
    ...markers.flatMap<MapPlaceMarker>((marker) => {
      if (!isFiniteNumber(marker?.placeId)
        || !isFiniteNumber(marker?.latitude)
        || !isFiniteNumber(marker?.longitude)) return [];

      return [{
        category: toMarkerCategory(marker.category),
        id: `place:${marker.placeId}`,
        kind: 'place',
        lat: marker.latitude,
        lng: marker.longitude,
        markerType: 'default',
        name: text(marker.name, 'Place'),
        placeId: marker.placeId,
      }];
    }),
    ...clusters.flatMap<MapPlaceMarker>((cluster) => {
      if (!isFiniteNumber(cluster?.latitude) || !isFiniteNumber(cluster?.longitude)) return [];
      const clusterId = text(cluster.clusterId, `${cluster.latitude}:${cluster.longitude}`);

      return [{
        category: 'etc',
        id: `cluster:${clusterId}`,
        kind: 'cluster',
        lat: cluster.latitude,
        lng: cluster.longitude,
        markerType: 'hot',
        name: String(isFiniteNumber(cluster.placeCount) ? cluster.placeCount : ''),
        placeId: null,
      }];
    }),
  ];
}

export function toPlaceResults(list: PlaceList | undefined): MapPlaceResult[] {
  const places = Array.isArray(list?.places) ? list.places : [];

  return places.flatMap<MapPlaceResult>((place) => {
    if (!isFiniteNumber(place?.id)
      || !isFiniteNumber(place?.latitude)
      || !isFiniteNumber(place?.longitude)) return [];

    return [{
      address: text(place.roadAddress, text(place.address)),
      category: text(place.category, 'OTHER'),
      coordinate: { lat: place.latitude, lng: place.longitude },
      distanceMeters: isFiniteNumber(place.distanceMeters) ? place.distanceMeters : null,
      id: place.id,
      name: text(place.name, 'Place'),
    }];
  });
}

export function toResultMarkers(results: MapPlaceResult[]): MapPlaceMarker[] {
  return results.map((place) => ({
    category: toMarkerCategory(place.category),
    id: `place:${place.id}`,
    kind: 'place',
    lat: place.coordinate.lat,
    lng: place.coordinate.lng,
    markerType: 'search',
    name: place.name,
    placeId: place.id,
  }));
}

export function toAutocompleteResults(data: PlaceAutocomplete | undefined): MapPlaceResult[] {
  const places = Array.isArray(data?.places) ? data.places : [];
  return toPlaceResults({ places });
}

export function toPlaceCardViewModel(
  card: PlaceCard | undefined,
  decision: PlaceVisitDecision | undefined,
  operatingNotices: PlaceOperatingNotices | undefined,
): MapPlaceCardViewModel | null {
  if (!card || !isFiniteNumber(card.id)) return null;
  const decisionPlace = decision?.place;
  const currentlyOperating = typeof operatingNotices?.currentlyOperating === 'boolean'
    ? operatingNotices.currentlyOperating
    : typeof decisionPlace?.currentlyOperating === 'boolean'
      ? decisionPlace.currentlyOperating
      : typeof card.currentlyOperating === 'boolean'
        ? card.currentlyOperating
        : null;
  const notices = Array.isArray(operatingNotices?.notices)
    ? operatingNotices.notices
    : [];

  return {
    address: text(card.roadAddress, text(card.address)),
    category: text(card.category, 'OTHER'),
    currentlyOperating,
    id: card.id,
    name: text(card.name, 'Place'),
    notice: text(notices.find((notice) => notice?.visibleNow !== false)?.message) || null,
    summary: text(card.touristSummary) || null,
  };
}
