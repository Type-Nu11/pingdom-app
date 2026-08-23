import {
  MAIN_ROUTES,
  parseMerchantId,
  parsePlaceId,
} from './types';
import type { MainNavigationIntent } from './navigationIntent';

export const APP_SCHEME = 'pingdom';
export const APP_LINK_PREFIX = `${APP_SCHEME}://`;

function getPathSegments(url: string): string[] | null {
  if (!url.toLowerCase().startsWith(APP_LINK_PREFIX)) {
    return null;
  }

  const rawPath = url.slice(APP_LINK_PREFIX.length).replace(/^\/+/, '').split(/[?#]/, 1)[0];

  try {
    return rawPath
      .split('/')
      .filter(Boolean)
      .map((segment) => decodeURIComponent(segment));
  } catch {
    return [];
  }
}

export function parseDeepLink(url: string): MainNavigationIntent | null {
  const segments = getPathSegments(url);

  if (!segments) {
    return null;
  }

  const [resource, rawId, action] = segments;
  const normalizedResource = resource?.toLowerCase();

  if (segments.length === 1 && normalizedResource === 'map') {
    return { screen: MAIN_ROUTES.Map };
  }

  if (segments.length === 1 && normalizedResource === 'coupons') {
    return { screen: MAIN_ROUTES.CouponWallet };
  }

  if (segments.length === 1 && normalizedResource === 'profile') {
    return { screen: MAIN_ROUTES.Profile };
  }

  if (segments.length === 1 && normalizedResource === 'settings') {
    return { screen: MAIN_ROUTES.Settings };
  }

  if (normalizedResource === 'places') {
    const placeId = parsePlaceId(rawId);

    if (placeId && segments.length === 2) {
      return { params: { focusedPlaceId: placeId }, screen: MAIN_ROUTES.Map };
    }

    if (placeId && segments.length === 3 && action?.toLowerCase() === 'check-in') {
      return { params: { placeId }, screen: MAIN_ROUTES.CheckIn };
    }
  }

  if (normalizedResource === 'merchants' && segments.length === 2) {
    const merchantId = parseMerchantId(rawId);

    if (merchantId) {
      return { params: { merchantId }, screen: MAIN_ROUTES.Merchant };
    }
  }

  return { screen: MAIN_ROUTES.Map };
}
