import type {
  MapViewport,
  PlaceAutocomplete,
  PlaceCard,
  PlaceList,
  PlaceOperatingNotices,
  PlaceVisitDecision,
  PlaceVerificationMedia,
} from '../../place-exploration';
import type { PlaceDetail } from '../../place-detail/model/placeDetail.types';
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
  distanceMeters: number | null;
  id: number;
  imageUrl: string | null;
  imageUrls: string[];
  name: string;
  notice: string | null;
  reservable: boolean;
  summary: string | null;
  supportTags: MapPlaceSupportTag[];
};

export type MapPlaceSupportTag =
  | 'coupon'
  | 'english'
  | 'englishMenu'
  | 'foreignCard'
  | 'reservation'
  | 'wifi';

export type MapPlaceSelection = Pick<MapPlaceResult, 'distanceMeters' | 'id'>;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const text = (value: unknown, fallback = '') =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback;

export function toMarkerCategory(value: unknown): MapMarkerCategory {
  const category = text(value).toUpperCase();
  if (category.includes('CULTURAL_HERITAGE')
    || category.includes('CULTURAL_PROPERTY')
    || category.includes('CULTURAL_ASSET')
    || category.includes('HERITAGE')
    || category.includes('HISTORIC')
    || category.includes('RUIN')
    || category.includes('문화재')
    || category.includes('유적')) return 'heritage';
  if (category.includes('EXHIBITION') || category.includes('SHOWING') || category.includes('ART')) return 'art';
  if (category.includes('BEAUTY')) return 'beauty';
  if (category.includes('CAFE')) return 'cafe';
  if (category.includes('FASHION')) return 'fashion';
  if (category.includes('FOOD') || category.includes('RESTAURANT')) return 'food';
  if (category.includes('POP_UP') || category.includes('POPUP')) return 'popup';
  if (category.includes('MUSIC') || category.includes('K_POP') || category.includes('NIGHTLIFE')) return 'music';
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
  distanceMeters: number | null = null,
  detail?: PlaceDetail,
  verificationMedia?: PlaceVerificationMedia,
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
  const mediaUrls = Array.isArray(verificationMedia?.media)
    ? verificationMedia.media
      .map((item) => text(item?.imageUrl, text(item?.thumbnailUrl)))
      .filter(Boolean)
    : [];
  const imageUrls = [...new Set([text(card.imageUrl), text(detail?.thumbnailUrl), ...mediaUrls])]
    .filter(Boolean);
  const support = detail?.touristSupport;
  const supportTags: MapPlaceSupportTag[] = [];

  if (support?.supportedLanguages.some((language) => language.toLowerCase().startsWith('en'))) {
    supportTags.push('english');
  }
  if (support?.englishMenu === 'AVAILABLE') supportTags.push('englishMenu');
  if (support?.foreignCard === 'AVAILABLE') supportTags.push('foreignCard');
  if (support?.freeWifi === 'AVAILABLE') supportTags.push('wifi');
  if (support?.couponAvailable) supportTags.push('coupon');
  if (support?.reservationAvailable) supportTags.push('reservation');

  const reservable = Boolean(
    support?.reservationAvailable
      || decision?.reservableAvailabilities?.some((availability) =>
        availability.status === 'ACTIVE' && (availability.remainingCapacity ?? 0) > 0),
  );

  return {
    address: text(card.roadAddress, text(card.address)),
    category: text(card.category, 'OTHER'),
    currentlyOperating,
    distanceMeters: isFiniteNumber(distanceMeters) ? distanceMeters : null,
    id: card.id,
    imageUrl: imageUrls[0] ?? null,
    imageUrls,
    name: text(card.name, 'Place'),
    notice: text(notices.find((notice) => notice?.visibleNow !== false)?.message) || null,
    reservable,
    summary: text(card.touristSummary) || null,
    supportTags,
  };
}
