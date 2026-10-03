import { buildNaverRouteUrl } from '../model/routePreparation';
import { openNaverRoute } from '../services/openNaverRoute';
const destination = { placeId: 1, name: '서울 & Cafe #1', latitude: 37.5, longitude: 127 };
const origin = { placeId: 0, name: 'My location', latitude: 37.6, longitude: 126.9 };
test.each([['car', 'car'], ['walk', 'walk'], ['transit', 'public'], ['bike', 'bicycle']] as const)('external %s preserves mode and coordinate order', (mode, scheme) => {
  const url = buildNaverRouteUrl(destination, origin, mode)!;
  expect(url.startsWith(`nmap://route/${scheme}?`)).toBe(true);
  expect(url).toContain('dlat=37.5&dlng=127&dname=%EC%84%9C%EC%9A%B8%20%26%20Cafe%20%231');
  expect(url).toContain('slat=37.6&slng=126.9&sname=My%20location');
  expect(url).toContain('appname=com.rmdka.pingdomapp');
});
test('omits only origin when location is unavailable; rejects invalid destination', () => {
  expect(buildNaverRouteUrl(destination, null, 'walk')).not.toContain('slat=');
  expect(buildNaverRouteUrl({ ...destination, longitude: null }, null, 'car')).toBeNull();
  expect(buildNaverRouteUrl(destination, { ...origin, latitude: NaN }, 'walk')).toBeNull();
});
test('native failures never masquerade as external navigation success', async () => {
  const native = { canOpenURL: jest.fn(async () => false), openURL: jest.fn(async () => undefined) };
  expect(await openNaverRoute(destination, null, 'walk', native)).toBe('not-installed');
  expect(native.openURL).not.toHaveBeenCalled();
  native.canOpenURL.mockResolvedValue(true);
  native.openURL.mockRejectedValueOnce(new Error('failed'));
  expect(await openNaverRoute(destination, null, 'transit', native)).toBe('failed');
  expect(await openNaverRoute(destination, origin, 'car', native)).toBe('opened');
});
