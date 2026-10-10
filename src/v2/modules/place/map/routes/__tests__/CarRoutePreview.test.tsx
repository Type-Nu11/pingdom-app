import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Alert, AppState, Linking, type AppStateStatus } from 'react-native';
import { renderWithProviders } from '../../../../../app/testing/testProviders';
import { ApiError } from '../../../../../shared/api/ApiError';
import CarRoutePreview from '../components/CarRoutePreview';
import { findCarRoute } from '../api/routesApi';
import { openNaverRoute } from '../services/openNaverRoute';
import type { NaverMapAdapterProps } from '../../native/components/NaverMapAdapter';

let mockMapProps: NaverMapAdapterProps;
const mockSaved = { places: [{ id: 2, name: 'Saved cafe', address: 'Cafe street', category: 'CAFE', latitude: 37.7, longitude: 127.2 }], isLoading: false, isError: false, hasNextPage: false, isFetchingNextPage: false, refetch: jest.fn(), fetchNextPage: jest.fn() };
jest.mock('../../../exploration', () => ({
  ...jest.requireActual('../../../exploration'),
  useBookmarkedPlaces: () => mockSaved,
  usePlaceAutocomplete: ({ keyword }: { keyword: string }) => ({
    data: { places: keyword === 'New place' ? [{ id: 3, name: 'New place', address: 'New street', category: 'FOOD', latitude: 37.9, longitude: 127.4 }] : [] },
    isLoading: false, isError: false, refetch: jest.fn(),
  }),
}));
jest.mock('../../native/components/NaverMapAdapter', () => ({ __esModule: true, default: (props: NaverMapAdapterProps) => {
  mockMapProps = props;
  const { View } = require('react-native');
  return <View testID="route-map" />;
} }));
jest.mock('../api/routesApi', () => ({ findCarRoute: jest.fn() }));
jest.mock('../services/openNaverRoute', () => ({ openNaverRoute: jest.fn(async () => 'opened') }));
const destination = { placeId: 1, name: '목적지', latitude: 37.6, longitude: 127.1 };
const location = { status: 'granted' as const, canAskAgain: true as const, coordinate: { lat: 37.5, lng: 127 } };
const route = { path: [{ lat: 37.501, lng: 127.001 }, { lat: 37.8, lng: 127.3 }, { lat: 37.601, lng: 127.101 }], distanceMeters: 12500, durationSeconds: 1800 };
const props = { destination, location, onClose: jest.fn(), onRefreshLocation: jest.fn() };

beforeEach(() => { jest.mocked(findCarRoute).mockReset().mockResolvedValue(route); jest.mocked(openNaverRoute).mockClear(); });

test.each(['ko', 'en'] as const)('shows full server path, endpoints and real summary in %s', async language => {
  jest.mocked(findCarRoute).mockResolvedValue(route);
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language });
  expect(findCarRoute).toHaveBeenCalledTimes(1);
  await fireEvent(screen.getByTestId('route-map').parent!, 'layout', { nativeEvent: { layout: { width: 390, height: 400 } } });
  await waitFor(() => expect(mockMapProps.routeCoordinates).toEqual(route.path));
  expect(mockMapProps.markers.map(p => p.id)).toEqual(['route-destination']);
  expect(mockMapProps.userCoordinate).toEqual(location.coordinate);
  expect(screen.getByLabelText(language === 'ko' ? '12.5 km · 예상 30분' : '12.5 km · Estimated 30 min')).toBeVisible();
  expect(mockMapProps.zoomLevel).toBeLessThan(14);
  const firstRevision = mockMapProps.cameraRevision!;
  await act(() => mockMapProps.onCameraGesture?.());
  await user.press(screen.getByRole('button', { name: language === 'ko' ? '전체 경로 보기' : 'Show entire route' }));
  expect(mockMapProps.cameraRevision).toBeGreaterThan(firstRevision);
});

test('gesture during a pending request prevents camera jump and cancellation clears route', async () => {
  let resolve!: (value: typeof route) => void;
  jest.mocked(findCarRoute).mockImplementation(() => new Promise(yes => { resolve = yes; }));
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await fireEvent(screen.getByTestId('route-map').parent!, 'layout', { nativeEvent: { layout: { width: 390, height: 400 } } });
  const previous = mockMapProps.center;
  await act(() => mockMapProps.onCameraGesture?.());
  await act(async () => resolve(route));
  expect(mockMapProps.routeCoordinates).toEqual(route.path);
  expect(mockMapProps.center).toEqual(previous);
  await user.press(screen.getByRole('tab', { name: 'Walk' }));
  await user.press(screen.getByRole('tab', { name: 'Car' }));
  expect(mockMapProps.routeCoordinates).toBeUndefined();
  await user.press(screen.getByRole('button', { name: 'Cancel request' }));
  const signal = jest.mocked(findCarRoute).mock.calls[1][2];
  expect(signal.aborted).toBe(true);
  await act(async () => resolve(route));
  expect(mockMapProps.routeCoordinates).toBeUndefined();
  expect(screen.getByText('Route request canceled.')).toBeVisible();
});

test('walk/transit use external navigation without additional car requests', async () => {
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  for (const [label, mode] of [['Walk', 'walk'], ['Transit', 'transit']]) {
    await user.press(screen.getByRole('tab', { name: label }));
    expect(screen.getByText('Use the NAVER Map app for this travel mode.')).toBeVisible();
    expect(screen.queryByTestId('route-request')).toBeNull();
    await user.press(screen.getByTestId('route-external'));
    expect(openNaverRoute).toHaveBeenLastCalledWith(destination, expect.objectContaining({ latitude: 37.5, longitude: 127 }), mode);
  }
  expect(findCarRoute).toHaveBeenCalledTimes(1);
});

test('permission denial allows external origin omission and settings recovery', async () => {
  const settings = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
  const refresh = jest.fn();
  const { user } = await renderWithProviders(<CarRoutePreview {...props} onRefreshLocation={refresh}
    location={{ status: 'denied', coordinate: null, canAskAgain: false }} />, { language: 'en' });
  expect(screen.queryByTestId('route-request')).toBeNull();
  expect(screen.getByRole('button', { name: 'Open location permission settings' })).toBeVisible();
  await user.press(screen.getByRole('button', { name: 'Open location permission settings' }));
  expect(settings).toHaveBeenCalledTimes(1);
  expect(refresh).not.toHaveBeenCalled();
  await user.press(screen.getByTestId('route-external'));
  expect(openNaverRoute).toHaveBeenCalledWith(destination, null, 'car');
  expect(findCarRoute).not.toHaveBeenCalled();
  settings.mockRestore();
});

test.each([true, false])('permission denial supports direct origin input (canAskAgain=%s)', async canAskAgain => {
  jest.mocked(findCarRoute).mockResolvedValue(route);
  const refresh = jest.fn();
  const { user } = await renderWithProviders(<CarRoutePreview {...props} onRefreshLocation={refresh}
    location={{ status: 'denied', coordinate: null, canAskAgain }} />, { language: 'en' });
  expect(screen.getByText('Location access is off')).toBeVisible();
  if (canAskAgain) {
    await user.press(screen.getByTestId('route-permission-recovery'));
    expect(refresh).toHaveBeenCalledTimes(1);
  }
  await user.press(screen.getByTestId('route-direct-input'));
  expect(screen.getByTestId('route-endpoint-search')).toBeVisible();
  await user.press(screen.getByRole('button', { name: 'Saved cafe' }));
  expect(findCarRoute).toHaveBeenCalledWith(expect.objectContaining({ name: 'Saved cafe' }), destination, expect.any(AbortSignal));
});

test('loading shows CTA and bar skeletons and keeps cancel available', async () => {
  jest.mocked(findCarRoute).mockImplementation(() => new Promise(() => {}));
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  expect(screen.getByTestId('route-loading-cta', { includeHiddenElements: true })).toHaveStyle({ width: 88, height: 48, borderRadius: 24 });
  expect(screen.getByTestId('route-loading-bar')).toHaveStyle({ height: 22, borderRadius: 11 });
  await user.press(screen.getByRole('button', { name: 'Cancel request' }));
  expect(screen.queryByTestId('route-loading-cta')).toBeNull();
});

test('projected bubble stays within the viewport and yields to the taller place editor', async () => {
  jest.mocked(findCarRoute).mockResolvedValue(route);
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await fireEvent(screen.getByTestId('route-map').parent!, 'layout', { nativeEvent: { layout: { width: 402, height: 874 } } });
  await waitFor(() => expect(mockMapProps.routeCoordinates).toEqual(route.path));
  await act(() => mockMapProps.onRouteAnchor?.({ x: 380, y: 350 }));
  const bubble = screen.getByText('Optimal route', { includeHiddenElements: true }).parent!.parent!.parent!;
  expect(bubble).toHaveStyle({ left: 266, top: 286, maxWidth: 370 });
  await user.press(screen.getByTestId('route-destination-row'));
  expect(screen.queryByText('Optimal route', { includeHiddenElements: true })).toBeNull();
});

test.each([
  [new ApiError('no path', { code: 'ROUTE_NOT_FOUND' }), 'No car route found'],
  [new ApiError('offline', { isNetworkError: true }), 'Unable to load route'],
])('route errors keep editing, retry and external recovery available', async (error, title) => {
  jest.mocked(findCarRoute).mockRejectedValueOnce(error).mockResolvedValueOnce(route);
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  expect(await screen.findByText(title as string)).toBeVisible();
  expect(screen.getByTestId('route-destination-row')).toBeEnabled();
  expect(screen.getByTestId('route-external')).toBeEnabled();
  expect(findCarRoute).toHaveBeenCalledTimes(1);
  await user.press(screen.getByTestId('route-request'));
  await waitFor(() => expect(mockMapProps.routeCoordinates).toEqual(route.path));
});

test('missing destination prevents internal and external requests', async () => {
  await renderWithProviders(<CarRoutePreview {...props} destination={{ ...destination, latitude: undefined }} />, { language: 'en' });
  expect(screen.getByText('Destination coordinates are missing.')).toBeVisible();
  expect(screen.getByTestId('route-request')).toBeDisabled();
  expect(screen.getByTestId('route-external')).toBeDisabled();
});

test('503 is an unavailable state with no geometry or automatic retry; external remains usable', async () => {
  jest.mocked(findCarRoute).mockRejectedValue(new ApiError('private message', { status: 503 }));
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await screen.findByText('Route service is currently unavailable. Use the NAVER Map app.');
  expect(screen.queryByText('private message')).toBeNull();
  expect(findCarRoute).toHaveBeenCalledTimes(1);
  expect(mockMapProps.routeCoordinates).toBeUndefined();
  expect(screen.getByTestId('route-external')).toBeEnabled();
});

test('external app absence is separate from route lookup error', async () => {
  jest.mocked(openNaverRoute).mockResolvedValueOnce('not-installed');
  const alert = jest.spyOn(Alert, 'alert');
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await user.press(screen.getByRole('tab', { name: 'Walk' }));
  await user.press(screen.getByTestId('route-external'));
  expect(alert).toHaveBeenCalledWith('Please install the NAVER Map app.');
  expect(findCarRoute).toHaveBeenCalledTimes(1);
});

test('invalid live origin offers location recovery and never requests a route', async () => {
  const onRefreshLocation = jest.fn();
  const { user } = await renderWithProviders(<CarRoutePreview {...props} onRefreshLocation={onRefreshLocation}
    location={{ ...location, coordinate: { lat: NaN, lng: 127 } }} />, { language: 'en' });
  expect(screen.getByText('Could not get your current location. Try again.')).toBeVisible();
  expect(screen.getByTestId('route-request')).toBeDisabled();
  await user.press(screen.getByRole('button', { name: 'Check current location again' }));
  expect(onRefreshLocation).toHaveBeenCalledTimes(1);
  expect(mockMapProps.logoTopMargin).toBe(16);
  expect(findCarRoute).not.toHaveBeenCalled();
});


test.each(['light', 'dark'] as const)('Figma sheet uses icon tabs, real result values and a projected bubble in %s', async colorScheme => {
  jest.mocked(findCarRoute).mockResolvedValue(route);
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, {
    language: 'en', colorScheme, appearancePreference: colorScheme === 'dark' ? 'DARK' : 'LIGHT',
  });
  expect(screen.getAllByRole('tab').map(tab => tab.props.accessibilityLabel)).toEqual(['Transit', 'Walk', 'Car', 'Bicycle']);
  expect(screen.getByRole('tab', { name: 'Car' }).props.accessibilityState).toEqual({ selected: true });
  expect(screen.getByRole('header', { name: 'Route' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Share place' })).toBeVisible();
  expect(screen.getByTestId('route-planner-sheet')).toHaveStyle({ left: 8, right: 8 });
  await fireEvent(screen.getByTestId('route-map').parent!, 'layout', { nativeEvent: { layout: { width: 402, height: 874 } } });
  await waitFor(() => expect(mockMapProps.routeCoordinates).toEqual(route.path));
  expect(screen.getByText('30 min')).toHaveStyle({ fontSize: 28 });
  expect(screen.getByTestId('route-start').props.accessibilityHint).toContain('Follows your location');
  expect(screen.queryByText('Optimal route', { includeHiddenElements: true })).toBeNull();
  await act(() => mockMapProps.onRouteAnchor?.({ x: 100, y: 250 }));
  expect(screen.getByText('Optimal route', { includeHiddenElements: true })).toBeOnTheScreen();
  expect(screen.getAllByText('30 min', { includeHiddenElements: true })).toHaveLength(2);
  await act(() => mockMapProps.onCameraGesture?.());
  expect(screen.queryByText('Optimal route', { includeHiddenElements: true })).toBeNull();
  await user.press(screen.getByTestId('route-start'));
  expect(screen.getByTestId('route-tracking-sheet')).toBeVisible();
  expect(openNaverRoute).not.toHaveBeenCalled();
  expect(findCarRoute).toHaveBeenCalledTimes(1);
});

test('swap drops late geometry, automatically queries reversed endpoints, and requires a fixed destination to start tracking', async () => {
  let resolve!: (value: typeof route) => void;
  jest.mocked(findCarRoute).mockImplementationOnce(() => new Promise(yes => { resolve = yes; })).mockResolvedValue(route);
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  const firstSignal = jest.mocked(findCarRoute).mock.calls[0][2];
  await fireEvent(screen.getByTestId('route-destination-row'), 'accessibilityAction', { nativeEvent: { actionName: 'swap' } });
  expect(firstSignal.aborted).toBe(true);
  await act(async () => resolve({ ...route, path: [{ lat: 1, lng: 1 }, { lat: 2, lng: 2 }] }));
  await waitFor(() => expect(mockMapProps.routeCoordinates).toEqual(route.path));
  expect(findCarRoute).toHaveBeenCalledTimes(2);
  expect(mockMapProps.userCoordinate).toEqual(location.coordinate);
  expect(findCarRoute).toHaveBeenLastCalledWith(destination, expect.objectContaining({ latitude: 37.5, longitude: 127 }), expect.anything());
  await screen.findByText('30 min');
  expect(screen.getByTestId('route-start')).toBeDisabled();
  expect(openNaverRoute).not.toHaveBeenCalled();
});

test.each(['light', 'dark'] as const)('tap opens Figma place editor and saved selection changes the real destination in %s', async colorScheme => {
  jest.mocked(findCarRoute).mockResolvedValue(route);
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en', colorScheme, appearancePreference: colorScheme === 'dark' ? 'DARK' : 'LIGHT' });
  await user.press(screen.getByTestId('route-destination-row'));
  expect(screen.getByTestId('route-endpoint-editor')).toBeVisible();
  expect(screen.queryByRole('tab', { name: 'Car' })).toBeNull();
  expect(screen.getByLabelText('Search places')).toBeVisible();
  expect(screen.getByText('Saved places')).toBeVisible();
  expect(screen.getByText('Recent searches')).toBeVisible();
  await user.press(screen.getByRole('button', { name: 'Saved cafe' }));
  expect(screen.queryByTestId('route-endpoint-editor')).toBeNull();
  expect(findCarRoute).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ placeId: 2, latitude: 37.7, longitude: 127.2 }), expect.anything());
});

test('search result edits origin, and changing both endpoints permits routes without GPS permission', async () => {
  jest.mocked(findCarRoute).mockResolvedValue(route);
  const { user } = await renderWithProviders(<CarRoutePreview {...props} location={{ status: 'denied', coordinate: null, canAskAgain: false }} />, { language: 'en' });
  await user.press(screen.getByTestId('route-origin-row'));
  await fireEvent.changeText(screen.getByTestId('route-endpoint-search'), 'New place');
  await user.press(await screen.findByText('New place'));
  expect(screen.queryByTestId('route-request')).toBeNull();
  expect(findCarRoute).toHaveBeenLastCalledWith(expect.objectContaining({ latitude: 37.9, longitude: 127.4 }), destination, expect.anything());
});

test('map confirmation uses the native camera coordinate and keeps user GPS separate', async () => {
  jest.mocked(findCarRoute).mockResolvedValue(route);
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await user.press(screen.getByTestId('route-origin-row'));
  await user.press(screen.getByRole('button', { name: 'Select on map' }));
  await act(() => mockMapProps.onCameraIdle?.({ lat: 36.9, lng: 126.9 }));
  await user.press(screen.getByTestId('route-map-confirm'));
  expect(findCarRoute).toHaveBeenLastCalledWith(expect.objectContaining({ latitude: 36.9, longitude: 126.9 }), destination, expect.anything());
  expect(mockMapProps.userCoordinate).toEqual(location.coordinate);
});

test('long press without crossing a row does not edit or swap endpoints', async () => {
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await fireEvent(screen.getByTestId('route-origin-row'), 'longPress');
  await fireEvent.press(screen.getByTestId('route-origin-row'));
  expect(screen.queryByTestId('route-endpoint-editor')).toBeNull();
  expect(screen.getByTestId('route-start')).toBeEnabled();
  expect(openNaverRoute).not.toHaveBeenCalled();
});


test('departure entry previews selected place to current location but requires a fixed destination to start tracking', async () => {
  jest.mocked(findCarRoute).mockResolvedValue(route);
  const { user } = await renderWithProviders(<CarRoutePreview {...props} initialEndpointRole="origin" />, { language: 'en' });
  expect(findCarRoute).toHaveBeenCalledTimes(1);
  expect(findCarRoute).toHaveBeenLastCalledWith(destination, expect.objectContaining({ isCurrentLocation: true, latitude: 37.5, longitude: 127 }), expect.any(AbortSignal));
  expect(screen.getByTestId('route-start')).toBeDisabled();
  expect(openNaverRoute).not.toHaveBeenCalled();
});


test('departure entry without current location cannot route to a missing destination', async () => {
  await renderWithProviders(<CarRoutePreview {...props} initialEndpointRole="origin"
    location={{ status: 'denied', coordinate: null, canAskAgain: false }} />, { language: 'en' });
  expect(screen.getByTestId('route-request')).toBeDisabled();
  expect(screen.getByTestId('route-external')).toBeDisabled();
  expect(findCarRoute).not.toHaveBeenCalled();
  expect(mockMapProps.markers.map(marker => marker.id)).toEqual(['route-origin']);
});

test.each(['origin', 'destination'] as const)('GPS changes clear a completed route when the %s entry uses current location', async initialEndpointRole => {
  jest.mocked(findCarRoute).mockResolvedValue(route);
  const { user, rerender } = await renderWithProviders(<CarRoutePreview {...props} initialEndpointRole={initialEndpointRole} />, { language: 'en' });
  await screen.findByText('30 min');
  await rerender(<CarRoutePreview {...props} initialEndpointRole={initialEndpointRole}
    location={{ ...location, coordinate: { lat: 37.55, lng: 127.05 } }} />);
  expect(mockMapProps.routeCoordinates).toBeUndefined();
  expect(screen.queryByText('30 min')).toBeNull();
  expect(screen.getByTestId('route-request')).toBeEnabled();
  expect(findCarRoute).toHaveBeenCalledTimes(1);
  await user.press(screen.getByTestId('route-request'));
  const [origin, destination] = jest.mocked(findCarRoute).mock.calls[1];
  expect(initialEndpointRole === 'origin' ? destination : origin).toEqual(expect.objectContaining({ latitude: 37.55, longitude: 127.05 }));
});

test.each(['origin', 'destination'] as const)('GPS changes discard an in-flight route when the %s entry uses current location', async initialEndpointRole => {
  let resolve!: (value: typeof route) => void;
  jest.mocked(findCarRoute).mockImplementationOnce(() => new Promise(yes => { resolve = yes; }));
  const { user, rerender } = await renderWithProviders(<CarRoutePreview {...props} initialEndpointRole={initialEndpointRole} />, { language: 'en' });
  const signal = jest.mocked(findCarRoute).mock.calls[0][2];
  await rerender(<CarRoutePreview {...props} initialEndpointRole={initialEndpointRole}
    location={{ ...location, coordinate: { lat: 37.55, lng: 127.05 } }} />);
  expect(signal.aborted).toBe(true);
  await act(async () => resolve(route));
  expect(mockMapProps.routeCoordinates).toBeUndefined();
  expect(screen.queryByText('30 min')).toBeNull();
  expect(findCarRoute).toHaveBeenCalledTimes(1);
});

test('GPS metadata refresh at the same coordinates preserves the completed route', async () => {
  jest.mocked(findCarRoute).mockResolvedValue(route);
  const { user, rerender } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await screen.findByText('30 min');
  await rerender(<CarRoutePreview {...props} location={{ ...location, coordinate: { ...location.coordinate, accuracyMeters: 15 } }} />);
  expect(mockMapProps.routeCoordinates).toEqual(route.path);
  expect(screen.getByText('30 min')).toBeVisible();
  expect(findCarRoute).toHaveBeenCalledTimes(1);
});

test('GPS changes preserve routes between two selected places', async () => {
  jest.mocked(findCarRoute).mockResolvedValue(route);
  const { user, rerender } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await user.press(screen.getByTestId('route-origin-row'));
  await user.press(screen.getByRole('button', { name: 'Saved cafe' }));
  await screen.findByText('30 min');
  await rerender(<CarRoutePreview {...props} location={{ ...location, coordinate: { lat: 37.55, lng: 127.05 } }} />);
  expect(mockMapProps.routeCoordinates).toEqual(route.path);
  expect(screen.getByText('30 min')).toBeVisible();
  expect(findCarRoute).toHaveBeenCalledTimes(2);
});

test('car selection queries automatically and repeated taps do not duplicate loading or ready requests', async () => {
  let resolve!: (value: typeof route) => void;
  jest.mocked(findCarRoute).mockImplementation(() => new Promise(yes => { resolve = yes; }));
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  expect(findCarRoute).toHaveBeenCalledTimes(1);
  expect(screen.queryByTestId('route-request')).toBeNull();
  await user.press(screen.getByRole('tab', { name: 'Car' }));
  expect(findCarRoute).toHaveBeenCalledTimes(1);
  const firstSignal = jest.mocked(findCarRoute).mock.calls[0][2];
  await user.press(screen.getByRole('tab', { name: 'Walk' }));
  expect(firstSignal.aborted).toBe(true);
  await user.press(screen.getByRole('tab', { name: 'Car' }));
  expect(findCarRoute).toHaveBeenCalledTimes(2);
  await act(async () => resolve(route));
  await user.press(screen.getByRole('tab', { name: 'Car' }));
  expect(findCarRoute).toHaveBeenCalledTimes(2);
});

test('cancel stays canceled until car is explicitly selected again', async () => {
  jest.mocked(findCarRoute).mockImplementation(() => new Promise(() => {}));
  const { user, rerender } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await user.press(screen.getByRole('button', { name: 'Cancel request' }));
  await rerender(<CarRoutePreview {...props} location={{ ...location, coordinate: { ...location.coordinate } }} />);
  expect(screen.getByText('Route request canceled.')).toBeVisible();
  expect(findCarRoute).toHaveBeenCalledTimes(1);
  await user.press(screen.getByRole('tab', { name: 'Car' }));
  expect(findCarRoute).toHaveBeenCalledTimes(2);
  expect(screen.getByRole('button', { name: 'Cancel request' })).toBeVisible();
});

test('first available current coordinates trigger automatic lookup', async () => {
  const { rerender } = await renderWithProviders(<CarRoutePreview {...props}
    location={{ status: 'loading', coordinate: null, canAskAgain: true }} />, { language: 'en' });
  expect(findCarRoute).not.toHaveBeenCalled();
  await rerender(<CarRoutePreview {...props} />);
  await screen.findByText('30 min');
  expect(findCarRoute).toHaveBeenCalledTimes(1);
  expect(findCarRoute).toHaveBeenCalledWith(expect.objectContaining({ latitude: 37.5, longitude: 127 }), destination, expect.any(AbortSignal));
});

function liveLocation(lat = 37.5, lng = 127, accuracyMeters = 10, observedAt = new Date().toISOString()) {
  return { ...location, coordinate: { lat, lng, accuracyMeters, observedAt } };
}

test('in-app tracking retains the road path across GPS changes, supports pan and resume, and confirms arrival', async () => {
  const { user, rerender } = await renderWithProviders(<CarRoutePreview {...props} location={liveLocation()} />, { language: 'en' });
  await user.press(screen.getByTestId('route-start'));
  expect(mockMapProps.followUser).toBe(true);
  expect(screen.getByTestId('route-tracking-guidance')).toBeVisible();
  const initialDistance = screen.getByTestId('route-tracking-distance').props.accessibilityLabel;
  expect(screen.getByTestId('route-tracking-summary')).toHaveTextContent(/Estimate at lookup.*30 min.*12.5 km/);
  expect(openNaverRoute).not.toHaveBeenCalled();
  expect(findCarRoute).toHaveBeenCalledTimes(1);
  await rerender(<CarRoutePreview {...props} location={liveLocation(37.55, 127.05)} />);
  expect(mockMapProps.routeCoordinates).toEqual(route.path);
  expect(mockMapProps.userCoordinate).toEqual({ lat: 37.55, lng: 127.05, accuracyMeters: 10, observedAt: expect.any(String) });
  expect(screen.getByTestId('route-tracking-distance')).toHaveTextContent(/Straight-line distance/);
  expect(screen.getByTestId('route-tracking-distance').props.accessibilityLabel).not.toBe(initialDistance);
  expect(screen.getByTestId('route-tracking-summary')).toHaveTextContent(/Estimate at lookup.*30 min.*12.5 km/);
  expect(findCarRoute).toHaveBeenCalledTimes(1);
  await act(() => mockMapProps.onCameraGesture?.());
  expect(mockMapProps.followUser).toBe(false);
  await user.press(screen.getByTestId('route-tracking-follow'));
  expect(mockMapProps.followUser).toBe(true);
  expect(mockMapProps.cameraFit).toBeUndefined();
  await rerender(<CarRoutePreview {...props} location={liveLocation(destination.latitude, destination.longitude)} />);
  expect(await screen.findByText('You have arrived')).toBeVisible();
  expect(screen.queryByTestId('route-tracking-summary')).toBeNull();
  expect(screen.queryByTestId('route-tracking-distance')).toBeNull();
  expect(mockMapProps.followUser).toBe(false);
  expect(mockMapProps.center).toEqual(expect.objectContaining({ lat: destination.latitude, lng: destination.longitude }));
  expect(mockMapProps.routeCoordinates).toEqual(route.path);
  // Arrival stays confirmed even if a subsequent noisy fix moves away.
  await rerender(<CarRoutePreview {...props} location={liveLocation()} />);
  expect(screen.getByText('You have arrived')).toBeVisible();
  await user.press(screen.getByTestId('route-tracking-stop'));
  expect(screen.queryByTestId('route-tracking-sheet')).toBeNull();
  expect(findCarRoute).toHaveBeenCalledTimes(2);
});

test('tracking pauses on permission loss and stale fixes, then recovers without discarding the path or requerying', async () => {
  const refresh = jest.fn();
  const { user, rerender } = await renderWithProviders(<CarRoutePreview {...props} onRefreshLocation={refresh} location={liveLocation()} />, { language: 'en' });
  await user.press(screen.getByTestId('route-start'));
  await rerender(<CarRoutePreview {...props} onRefreshLocation={refresh} location={{ status: 'denied', coordinate: null, canAskAgain: false }} />);
  expect(screen.getByText('Check your current location again')).toBeVisible();
  expect(mockMapProps.followUser).toBe(false);
  expect(mockMapProps.userCoordinate).toBeUndefined();
  expect(mockMapProps.routeCoordinates).toEqual(route.path);
  expect(screen.getByTestId('route-tracking-settings')).toBeVisible();
  await user.press(screen.getByTestId('route-tracking-refresh'));
  expect(refresh).toHaveBeenCalledTimes(1);
  await rerender(<CarRoutePreview {...props} location={liveLocation(destination.latitude, destination.longitude, 10, new Date(Date.now() - 60_000).toISOString())} />);
  expect(screen.queryByText('You have arrived')).toBeNull();
  expect(mockMapProps.followUser).toBe(false);
  await rerender(<CarRoutePreview {...props} location={liveLocation(37.55, 127.05)} />);
  expect(screen.getByText('Following route')).toBeVisible();
  expect(mockMapProps.followUser).toBe(true);
  expect(findCarRoute).toHaveBeenCalledTimes(1);
});

test('starting from a selected origin fetches a route from actual GPS, and stopping aborts that request', async () => {
  const { user } = await renderWithProviders(<CarRoutePreview {...props} location={liveLocation()} />, { language: 'en' });
  await user.press(screen.getByTestId('route-origin-row'));
  await user.press(screen.getByRole('button', { name: 'Saved cafe' }));
  let resolve!: (value: typeof route) => void;
  jest.mocked(findCarRoute).mockImplementationOnce(() => new Promise(yes => { resolve = yes; }));
  await user.press(screen.getByTestId('route-start'));
  expect(findCarRoute).toHaveBeenLastCalledWith(expect.objectContaining({ latitude: 37.5, longitude: 127 }), destination, expect.any(AbortSignal));
  const signal = jest.mocked(findCarRoute).mock.calls[2][2];
  expect(screen.getByText('Finding a route from your location')).toBeVisible();
  await user.press(screen.getByTestId('route-tracking-stop'));
  expect(signal.aborted).toBe(true);
  await act(async () => resolve(route));
  expect(screen.queryByTestId('route-tracking-sheet')).toBeNull();
});

test('imprecise GPS at the destination does not claim arrival', async () => {
  const { user, rerender } = await renderWithProviders(<CarRoutePreview {...props} location={liveLocation()} />, { language: 'en' });
  await user.press(screen.getByTestId('route-start'));
  await rerender(<CarRoutePreview {...props} location={liveLocation(destination.latitude, destination.longitude, 100)} />);
  expect(screen.queryByText('You have arrived')).toBeNull();
  expect(screen.getByText('Following route')).toBeVisible();
});


test('backgrounding pauses tracking and cannot confirm arrival until the app is active', async () => {
  let onChange!: (state: AppStateStatus) => void;
  const originalListener = AppState.addEventListener;
  AppState.addEventListener = jest.fn().mockImplementation((_event, listener) => {
    onChange = listener;
    return { remove: jest.fn() };
  });
  try {
    const { user, rerender } = await renderWithProviders(<CarRoutePreview {...props} location={liveLocation()} />, { language: 'en' });
    await user.press(screen.getByTestId('route-start'));
    await act(() => onChange('background'));
    await rerender(<CarRoutePreview {...props} location={liveLocation(destination.latitude, destination.longitude)} />);
    expect(mockMapProps.followUser).toBe(false);
    expect(mockMapProps.routeCoordinates).toEqual(route.path);
    expect(screen.queryByText('You have arrived')).toBeNull();
    await act(() => onChange('active'));
    expect(await screen.findByText('You have arrived')).toBeVisible();
    expect(findCarRoute).toHaveBeenCalledTimes(1);
  } finally {
    AppState.addEventListener = originalListener;
  }
});

test('tracking lookup errors stay visible without automatic retry and can be exited', async () => {
  const { user, rerender } = await renderWithProviders(<CarRoutePreview {...props} location={liveLocation()} />, { language: 'en' });
  await user.press(screen.getByTestId('route-origin-row'));
  await user.press(screen.getByRole('button', { name: 'Saved cafe' }));
  jest.mocked(findCarRoute).mockRejectedValueOnce(new ApiError('offline', { isNetworkError: true }));
  await user.press(screen.getByTestId('route-start'));
  expect(await screen.findByText('Check your connection and try again.')).toBeVisible();
  expect(mockMapProps.routeCoordinates).toBeUndefined();
  await rerender(<CarRoutePreview {...props} location={liveLocation(37.55, 127.05)} />);
  expect(findCarRoute).toHaveBeenCalledTimes(3);
  expect(openNaverRoute).not.toHaveBeenCalled();
  await user.press(screen.getByTestId('route-tracking-stop'));
  expect(screen.queryByTestId('route-tracking-sheet')).toBeNull();
});
