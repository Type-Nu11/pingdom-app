import type { LocationState } from '../../camera/model/map.types';

export type RouteMode = 'transit' | 'walk' | 'car' | 'bike';

export type RouteDestination = {
  address?: string | null;
  englishName?: string | null;
  latitude: number | null;
  longitude: number | null;
  name: string;
  placeId: number;
};

export type RouteSegment = {
  kind: 'walk' | 'subway' | 'bus';
  minutes: number;
};

export type RoutePreview = {
  arrival: string;
  distance: string;
  duration: string;
  meta: string;
  segments?: RouteSegment[];
  steps?: { title: string; subtitle: string; meta?: string }[];
};

export type RouteUiState =
  | { kind: 'loading' }
  | { kind: 'location-denied' }
  | { kind: 'missing-destination' }
  | { kind: 'unavailable' }
  | { kind: 'no-transit' }
  | { kind: 'ready'; preview: RoutePreview };

export function hasRouteDestinationCoordinates(destination: RouteDestination): boolean {
  return destination.latitude != null
    && destination.longitude != null
    && Number.isFinite(destination.latitude)
    && Number.isFinite(destination.longitude)
    && destination.latitude >= -90
    && destination.latitude <= 90
    && destination.longitude >= -180
    && destination.longitude <= 180;
}

/** Route data is supplied by a future route provider. Never derive an ETA from straight-line distance. */
export function selectRouteUiState({
  destination,
  location,
  preview,
}: {
  destination: RouteDestination;
  location: Pick<LocationState, 'status'>;
  preview?: RoutePreview | null;
}): RouteUiState {
  if (!hasRouteDestinationCoordinates(destination)) return { kind: 'missing-destination' };
  if (location.status === 'loading') return { kind: 'loading' };
  if (location.status === 'denied') return { kind: 'location-denied' };
  if (location.status !== 'granted') return { kind: 'unavailable' };
  if (preview) return { kind: 'ready', preview };
  return { kind: 'unavailable' };
}

/** Figma sample data is used only by the explicit development mock transport. */
const routeDesignPreviewKo: Record<Exclude<RouteMode, 'bike'>, RoutePreview> = {
  transit: {
    arrival: '14:40', distance: '12.3km', duration: '38분',
    meta: '₩1,500 · 환승 1회 · 도보 7분',
    segments: [
      { kind: 'walk', minutes: 4 },
      { kind: 'subway', minutes: 12 },
      { kind: 'bus', minutes: 18 },
      { kind: 'walk', minutes: 3 },
    ],
    steps: [
      { title: 'My Location', subtitle: '나의 위치', meta: '14:02 출발' },
      { title: 'Walk 4 min · 280m', subtitle: '도보 4분 · 진천역 3번 출구' },
      { title: 'Line 1 · Jincheon → Seolhwa-Myeonggok', subtitle: '1호선 진천역 → 설화명곡역', meta: '12분 · 3개 역' },
      { title: 'Transfer to Bus · 버스 환승', subtitle: '설화명곡역 2번 출구 → 정류장' },
      { title: 'Express 8 · 급행8', subtitle: '설화명곡역 → 구지면행정복지센터', meta: '18분 · 9개 정류장' },
      { title: 'Walk 3 min · 190m', subtitle: '도보 3분' },
    ],
  },
  walk: {
    arrival: '17:13', distance: '12.3km', duration: '2시간 51분',
    meta: '약 17,400걸음 · 오르막 적음',
  },
  car: {
    arrival: '14:23', distance: '12.3km', duration: '21분',
    meta: '예상 요금 ₩15,800 · 통행료 없음',
  },
};

const routeDesignPreviewEn: Record<Exclude<RouteMode, 'bike'>, RoutePreview> = {
  transit: {
    arrival: '14:40', distance: '12.3 km', duration: '38 min',
    meta: '₩1,500 · 1 transfer · 7 min walking',
    segments: routeDesignPreviewKo.transit.segments,
    steps: [
      { title: 'My Location', subtitle: 'Current position', meta: 'Depart 14:02' },
      { title: 'Walk 4 min · 280 m', subtitle: 'Jincheon Station, Exit 3' },
      { title: 'Line 1 · Jincheon → Seolhwa-Myeonggok', subtitle: '12 min · 3 stops' },
      { title: 'Transfer to bus', subtitle: 'Seolhwa-Myeonggok Station, Exit 2' },
      { title: 'Express 8', subtitle: '18 min · 9 stops' },
      { title: 'Walk 3 min · 190 m', subtitle: 'Walk to the destination' },
    ],
  },
  walk: { arrival: '17:13', distance: '12.3 km', duration: '2 hr 51 min', meta: 'About 17,400 steps · Gentle slopes' },
  car: { arrival: '14:23', distance: '12.3 km', duration: '21 min', meta: 'Estimated fare ₩15,800 · No tolls' },
};

export function routeDesignPreview(language: string): Record<Exclude<RouteMode, 'bike'>, RoutePreview> {
  return language.startsWith('ko') ? routeDesignPreviewKo : routeDesignPreviewEn;
}
