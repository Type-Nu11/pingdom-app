import { buildNaverRouteUrl, canPreviewRoutes, fitRouteCamera, sampleRoute } from '../routePreparation';
import { Linking } from 'react-native';
import { openNaverRoute } from '../../services/openNaverRoute';

const destination = { ...sampleRoute.destination, name: '카페 & coffee / #1' };
test.each([['transit', 'public'], ['walk', 'walk'], ['car', 'car'], ['bike', 'bicycle']] as const)('encodes %s destinations and manual start coordinates', (mode, path) => {
  const url = new URL(buildNaverRouteUrl(destination, sampleRoute.origin, mode)!);
  expect(url.pathname).toBe(`/${path}`);
  expect(url.searchParams.get('dname')).toBe(destination.name);
  expect(url.searchParams.get('slat')).toBe(String(sampleRoute.origin.latitude));
  expect(url.searchParams.get('dlng')).toBe(String(destination.longitude));
  expect(url.searchParams.get('appname')).toBe('com.rmdka.pingdomapp');
});
test('rejects invalid endpoints and omits unavailable current position', () => {
  expect(buildNaverRouteUrl({ ...destination, latitude: null }, null, 'walk')).toBeNull();
  expect(buildNaverRouteUrl(destination, { ...sampleRoute.origin, longitude: NaN }, 'walk')).toBeNull();
  expect(buildNaverRouteUrl(destination, null, 'walk')).not.toContain('slat');
});
test('sample data is gated by both development build and environment', () => {
  expect(canPreviewRoutes(true, 'development')).toBe(true);
  for (const environment of ['production', 'staging', 'development']) expect(canPreviewRoutes(false, environment)).toBe(false);
  expect(canPreviewRoutes(true, 'production')).toBe(false);
});
test('camera fits intermediate bends and adapts to available height', () => {
  const points = [...sampleRoute.path, { lat: 37.7, lng: 127.1 }];
  const camera = fitRouteCamera(points, 360, 280);
  expect(camera.lat).toBeGreaterThan(37.6);
  expect(camera.zoom).toBeLessThan(fitRouteCamera(sampleRoute.path, 360, 280).zoom);
  expect(fitRouteCamera(points, 360, 500).zoom).toBeGreaterThanOrEqual(camera.zoom);
});
test('external launch distinguishes missing app, failed launch, and success', async () => {
  const canOpen = jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(false);
  const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  expect(await openNaverRoute(destination, null, 'walk')).toBe('not-installed');
  expect(open).not.toHaveBeenCalled();
  canOpen.mockResolvedValue(true);
  expect(await openNaverRoute(destination, null, 'walk')).toBe('opened');
  open.mockRejectedValue(new Error('failed'));
  expect(await openNaverRoute(destination, null, 'walk')).toBe('failed');
  jest.restoreAllMocks();
});
