import * as Location from 'expo-location';
import { getCurrentCoordinate } from '../../../../shared/location/currentLocation';
import { watchCurrentLocation } from '../../map/location/services/locationService';
import { getCurrentLocation } from '../../map/location';
import { locationPermissionService } from '../services/locationPermission';

jest.mock('expo-location', () => ({
  Accuracy: { High: 4, Balanced: 3 },
  getForegroundPermissionsAsync: jest.fn(), requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(), watchPositionAsync: jest.fn(),
}));
const permission = (status: 'denied' | 'granted' | 'undetermined', canAskAgain = true): Location.LocationPermissionResponse => ({
  status: status as Location.PermissionStatus, canAskAgain, granted: status === 'granted', expires: 'never',
});

beforeEach(() => {
  jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue(permission('denied'));
  jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue(permission('granted'));
  jest.mocked(Location.getCurrentPositionAsync).mockResolvedValue({
    coords: { latitude: 37.5, longitude: 127, accuracy: 12, altitude: null, altitudeAccuracy: null, heading: null, speed: null },
    timestamp: 0,
  });
});

test.each([
  ['map', getCurrentLocation], ['check-in', getCurrentCoordinate],
] as const)('%s explicit coordinate flow still requests and reads location', async (_, getLocation) => {
  const result = await getLocation();
  expect(result.status).toBe('granted');
  expect(result.coordinate).toMatchObject({ accuracyMeters: 12, observedAt: '1970-01-01T00:00:00.000Z' });
  expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
  expect(Location.getCurrentPositionAsync).toHaveBeenCalledTimes(1);
});

test.each([
  ['map', getCurrentLocation], ['check-in', getCurrentCoordinate],
] as const)('%s blocked permission still avoids requests and coordinates', async (_, getLocation) => {
  jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue(permission('denied', false));
  expect(await getLocation()).toMatchObject({ status: 'denied', coordinate: null });
  expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
});

test('visit verification status lookup retains undetermined without requesting or collecting', async () => {
  jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue(permission('undetermined'));
  expect(await locationPermissionService.getStatus()).toBe('undetermined');
  expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
});

test('route start requests high accuracy while ordinary map requests retain balanced accuracy', async () => {
  jest.mocked(Location.getForegroundPermissionsAsync).mockResolvedValue(permission('granted'));
  await getCurrentLocation(false, true);
  expect(Location.getCurrentPositionAsync).toHaveBeenLastCalledWith({ accuracy: Location.Accuracy.High });
  await getCurrentLocation(false);
  expect(Location.getCurrentPositionAsync).toHaveBeenLastCalledWith({ accuracy: Location.Accuracy.Balanced });
});

test('route tracking requests updates even while stationary without changing ordinary map watching', async () => {
  const listener = jest.fn();
  await watchCurrentLocation(listener, true);
  expect(Location.watchPositionAsync).toHaveBeenLastCalledWith({ accuracy: Location.Accuracy.High, distanceInterval: 0, timeInterval: 1000 }, expect.any(Function));
  await watchCurrentLocation(listener);
  expect(Location.watchPositionAsync).toHaveBeenLastCalledWith({ accuracy: Location.Accuracy.Balanced, distanceInterval: 10, timeInterval: 5000 }, expect.any(Function));
});
