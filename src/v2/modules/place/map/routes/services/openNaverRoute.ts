import { Linking } from 'react-native';
import { buildNaverRouteUrl, type RouteEndpoint } from '../model/routePreparation';
import type { RouteMode } from '../model/routeUi';

export async function openNaverRoute(destination: RouteEndpoint, origin: RouteEndpoint | null, mode: RouteMode): Promise<'opened' | 'not-installed' | 'invalid' | 'failed'> {
  const url = buildNaverRouteUrl(destination, origin, mode);
  if (!url) return 'invalid';
  try {
    if (!await Linking.canOpenURL(url)) return 'not-installed';
    await Linking.openURL(url);
    return 'opened';
  } catch { return 'failed'; }
}
