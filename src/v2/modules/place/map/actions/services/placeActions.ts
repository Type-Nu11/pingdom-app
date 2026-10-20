import {
  nativePlaceActionBridge,
  type NativeShareContent,
  type PlaceActionNative,
} from '../../../../../shared/native/placeActionBridge';

export type { PlaceActionNative } from '../../../../../shared/native/placeActionBridge';

export type PlaceActionTarget = {
  address?: string | null;
  latitude: number;
  longitude: number;
  name: string;
  placeId: number;
  userLocation?: { latitude: number; longitude: number } | null;
};

export type SharePlaceOutcome = 'dismissed' | 'failed' | 'shared' | 'unavailable';
export type DirectionsOutcome =
  | 'availability-check-failed'
  | 'invalid-location'
  | 'open-failed'
  | 'opened'
  | 'unavailable';

const APP_PLACE_LINK_PREFIX = 'pingdom://places/';
const KAKAO_DIRECTIONS_LINK_PREFIX = 'https://map.kakao.com/link/to/';

export function hasValidCoordinates(
  value: Pick<PlaceActionTarget, 'latitude' | 'longitude'>,
): boolean {
  return Number.isFinite(value.latitude)
    && value.latitude >= -90
    && value.latitude <= 90
    && Number.isFinite(value.longitude)
    && value.longitude >= -180
    && value.longitude <= 180;
}

function hasValidPlaceId(placeId: number): boolean {
  return Number.isSafeInteger(placeId) && placeId > 0;
}

export function buildPlaceShareContent(target: PlaceActionTarget): NativeShareContent {
  const name = target.name.trim();
  const address = target.address?.trim();
  const officialPlaceLink = hasValidPlaceId(target.placeId)
    ? `${APP_PLACE_LINK_PREFIX}${target.placeId}`
    : null;
  const coordinate = hasValidCoordinates(target)
    ? `${target.latitude}, ${target.longitude}`
    : null;

  return {
    message: [name, officialPlaceLink ? address : address || coordinate, officialPlaceLink]
      .filter((value): value is string => Boolean(value))
      .join('\n'),
    title: name,
  };
}

export function buildKakaoDirectionsUrl(target: PlaceActionTarget): string | null {
  if (!hasValidCoordinates(target)) return null;
  return `${KAKAO_DIRECTIONS_LINK_PREFIX}${encodeURIComponent(target.name.trim())},${target.latitude},${target.longitude}`;
}

export async function sharePlace(
  target: PlaceActionTarget,
  native: PlaceActionNative = nativePlaceActionBridge,
): Promise<SharePlaceOutcome> {
  if (!native.isShareAvailable()) return 'unavailable';

  try {
    return await native.share(buildPlaceShareContent(target));
  } catch {
    return 'failed';
  }
}

export async function openPlaceDirections(
  target: PlaceActionTarget,
  native: PlaceActionNative = nativePlaceActionBridge,
): Promise<DirectionsOutcome> {
  const url = buildKakaoDirectionsUrl(target);
  if (!url) return 'invalid-location';

  let canOpen: boolean;
  try {
    canOpen = await native.canOpenUrl(url);
  } catch {
    return 'availability-check-failed';
  }
  if (!canOpen) return 'unavailable';

  try {
    await native.openUrl(url);
    return 'opened';
  } catch {
    return 'open-failed';
  }
}
