import { Linking } from 'react-native';
import { buildNaverRouteUrl, type RouteEndpoint } from '../model/routePreparation';
import type { RouteMode } from '../model/routeUi';

export type NaverRouteNative = Pick<typeof Linking, 'canOpenURL' | 'openURL'>;
export async function openNaverRoute(destination: RouteEndpoint, origin: RouteEndpoint | null, mode: RouteMode, native: NaverRouteNative = Linking): Promise<'opened' | 'not-installed' | 'invalid' | 'failed'> {
  const url = buildNaverRouteUrl(destination, origin, mode);
  if (!url) return 'invalid';
  try {
    if (!await native.canOpenURL(url)) return 'not-installed';
    await native.openURL(url);
    return 'opened';
  } catch { return 'failed'; }
}
