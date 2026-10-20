import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Alert, AppState, Linking, type AppStateStatus } from 'react-native';
import { renderWithProviders } from '../../../../../app/testing/testProviders';
import { ApiError } from '../../../../../shared/api/ApiError';
import CarRoutePreview from '../components/CarRoutePreview';
import { findWalkingRoute } from '../api/walkingRoutesApi';
import { findCarRoute } from '../api/routesApi';
import { findTransitRoute, type TransitRoute } from '../api/transitRoutesApi';
import { transitResponse } from './transitFixture';
import { getCurrentLocation, watchCurrentLocation } from '../../location/services/locationService';
import { openNaverRoute } from '../services/openNaverRoute';
import type { NaverMapAdapterProps } from '../../native/components/NaverMapAdapter';

const mockRemoveLocationWatch = jest.fn();
jest.mock('../../location/services/locationService', () => ({ getCurrentLocation: jest.fn(), watchCurrentLocation: jest.fn() }));

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
jest.mock('../api/walkingRoutesApi', () => ({ findWalkingRoute: jest.fn() }));
jest.mock('../api/routesApi', () => ({ findCarRoute: jest.fn() }));
jest.mock('../api/transitRoutesApi', () => ({ ...jest.requireActual('../api/transitRoutesApi'), findTransitRoute: jest.fn() }));
jest.mock('../services/openNaverRoute', () => ({ openNaverRoute: jest.fn(async () => 'opened') }));
const destination = { placeId: 1, name: '목적지', latitude: 37.6, longitude: 127.1 };
const location = { status: 'granted' as const, canAskAgain: true as const, coordinate: { lat: 37.5, lng: 127, accuracyMeters: 10, observedAt: new Date().toISOString() } };
const route = { path: [{ lat: 37.501, lng: 127.001 }, { lat: 37.8, lng: 127.3 }, { lat: 37.601, lng: 127.101 }], distanceMeters: 12500, durationSeconds: 1800 };
const props = { destination, location, onClose: jest.fn(), onRefreshLocation: jest.fn() };

const transit: TransitRoute = jest.requireActual('../api/transitRoutesApi').mapTransitRouteResponse(transitResponse);
const walking = { path: [{ lat: 37.5, lng: 127 }, { lat: 37.52, lng: 127.02 }, { lat: 37.6, lng: 127.1 }], distanceMeters: 800, durationSeconds: 600, steps: [{ instruction: 'Cross the bridge', path: [] }] };
beforeEach(() => { jest.mocked(findWalkingRoute).mockReset().mockResolvedValue(walking); });
beforeEach(() => { jest.mocked(findTransitRoute).mockReset().mockResolvedValue(transit); });

test('transit alternatives change summary, leg markers, separate map paths together without a details screen', async () => {
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await user.press(screen.getByRole('tab', { name: 'Transit' }));
  expect(await screen.findByText('20 min')).toBeVisible();
  expect(mockMapProps.routeCoordinates).toBeUndefined();
  expect(mockMapProps.routeSegments).toEqual([
    { path: [{ lat: 37.5, lng: 127 }, { lat: 37.501, lng: 127.001 }], color: '#767680' },
    { path: [{ lat: 37.502, lng: 127.002 }, { lat: 37.6, lng: 127.1 }], color: '#00A84D' },
  ]);
  expect(mockMapProps.markers.some(marker => marker.caption === 'Central')).toBe(true);
  await user.press(screen.getByRole('button', { name: 'Route 2 of 2' }));
  expect(screen.getByTestId('transit-summary')).toHaveTextContent(/30 min/);
  expect(mockMapProps.routeSegments).toEqual([{ path: [{ lat: 37.5, lng: 127 }, { lat: 37.55, lng: 127.2 }, { lat: 37.6, lng: 127.1 }], color: '#008BFF' }]);
  expect(screen.queryByRole('button', { name: 'Route details' })).toBeNull();
  await user.press(screen.getByRole('tab', { name: 'Car' }));
  expect(mockMapProps.routeSegments).toBeUndefined();
  expect(mockMapProps.routeCoordinates).toEqual(route.path);
});

test('transit late response cannot replace car and pending I/O is canceled on mode change and unmount', async () => {
  let resolve!: (value: typeof transit) => void;
  jest.mocked(findTransitRoute).mockImplementation(() => new Promise(yes => { resolve = yes; }));
  const { user, unmount } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await user.press(screen.getByRole('tab', { name: 'Transit' }));
  const signal = jest.mocked(findTransitRoute).mock.calls[0][2];
  await user.press(screen.getByRole('tab', { name: 'Car' }));
  expect(signal.aborted).toBe(true);
  await act(async () => resolve(transit));
  expect(mockMapProps.routeCoordinates).toEqual(route.path);
  expect(screen.queryByTestId('transit-summary')).toBeNull();
  await user.press(screen.getByRole('tab', { name: 'Transit' }));
  const secondSignal = jest.mocked(findTransitRoute).mock.calls[1][2];
  await unmount();
  expect(secondSignal.aborted).toBe(true);
});

test('429 cooldown survives endpoint and mode changes and applies to both route providers', async () => {
  jest.mocked(findTransitRoute).mockRejectedValue(new ApiError('limited', { status: 429, retryAfterSeconds: 120 }));
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await user.press(screen.getByRole('tab', { name: 'Transit' }));
  expect(await screen.findByText(/Too many requests/)).toBeVisible();
  await user.press(screen.getByRole('tab', { name: 'Car' }));
  expect(screen.getByText(/Too many requests/)).toBeVisible();
  expect(findCarRoute).toHaveBeenCalledTimes(1);
  await fireEvent(screen.getByTestId('route-destination-row'), 'accessibilityAction', { nativeEvent: { actionName: 'swap' } });
  expect(findCarRoute).toHaveBeenCalledTimes(1);
  await user.press(screen.getByRole('tab', { name: 'Transit' }));
  expect(findTransitRoute).toHaveBeenCalledTimes(1);
});

test.each([
  [401, 'INVALID_TOKEN', /sign in again/i], [403, 'FORBIDDEN', /permission/],
  [422, 'ROUTE_NOT_FOUND', /No transit route found\./], [504, 'ROUTE_PROVIDER_TIMEOUT', /timed out/],
  [503, 'ROUTE_PROVIDER_UNAVAILABLE', /unavailable/],
] as const)('transit failure %s keeps recovery available without inventing geometry or retrying', async (status, code, message) => {
  jest.mocked(findTransitRoute).mockRejectedValue(new ApiError('server detail', { status, code }));
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await user.press(screen.getByRole('tab', { name: 'Transit' }));
  expect(await screen.findByText(message)).toBeVisible();
  expect(mockMapProps.routeSegments).toBeUndefined();
  expect(screen.getByTestId('route-request')).toBeVisible();
  expect(screen.queryByTestId('route-external')).toBeNull();
  expect(findTransitRoute).toHaveBeenCalledTimes(1);
});

test('transit endpoint changes abort previous geometry and selecting the same pending tab cannot duplicate calls', async () => {
  let resolve!: (value: TransitRoute) => void;
  jest.mocked(findTransitRoute).mockImplementationOnce(() => new Promise(yes => { resolve = yes; }));
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await user.press(screen.getByRole('tab', { name: 'Transit' }));
  const signal = jest.mocked(findTransitRoute).mock.calls[0][2];
  await user.press(screen.getByRole('tab', { name: 'Transit' }));
  expect(findTransitRoute).toHaveBeenCalledTimes(1);
  await fireEvent(screen.getByTestId('route-destination-row'), 'accessibilityAction', { nativeEvent: { actionName: 'swap' } });
  expect(signal.aborted).toBe(true);
  expect(findTransitRoute).toHaveBeenCalledTimes(2);
  const secondGeometry = mockMapProps.routeSegments;
  await act(async () => resolve({ itineraries: [transit.itineraries[1]] }));
  expect(mockMapProps.routeSegments).toEqual(secondGeometry);
  expect(screen.getByText('20 min')).toBeVisible();
});

test.each(['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'vi', 'es', 'pt-BR'] as const)('transit summary retains localized controls in %s dark mode without fabricating missing fields', async language => {
  jest.mocked(findTransitRoute).mockResolvedValue({ itineraries: [{ distanceMeters: 100, durationSeconds: 60,
    legs: [{ mode: 'UNKNOWN', path: [], stations: [] }] }] });
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language, colorScheme: 'dark', appearancePreference: 'DARK' });
  await user.press(screen.getAllByRole('tab')[0]);
  const summary = screen.getByTestId('transit-summary');
  expect(summary).not.toHaveTextContent(/routes\.|transit\.|undefined|NaN|fare|요금/);
  expect(mockMapProps.routeSegments).toEqual([]);
  expect(screen.queryByRole('button', { name: /Route 1 of 1/ })).toBeNull();
  expect(screen.queryByTestId('transit-details')).toBeNull();
  expect(screen.getByTestId('transit-start-button')).toBeDisabled();
});

beforeEach(() => { jest.mocked(getCurrentLocation).mockReset().mockResolvedValue({ status: 'failed', coordinate: null, canAskAgain: true }); jest.mocked(watchCurrentLocation).mockReset().mockResolvedValue({ remove: mockRemoveLocationWatch }); mockRemoveLocationWatch.mockClear(); location.coordinate.observedAt = new Date().toISOString(); jest.mocked(findCarRoute).mockReset().mockResolvedValue(route); jest.mocked(openNaverRoute).mockClear(); });

test.each(['ko', 'en'] as const)('shows full server path, endpoints and real summary in %s', async language => {
  jest.mocked(findCarRoute).mockResolvedValue(route);
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language });
  expect(findCarRoute).toHaveBeenCalledTimes(1);
  await fireEvent(screen.getByTestId('route-map').parent!, 'layout', { nativeEvent: { layout: { width: 390, height: 400 } } });
  await waitFor(() => expect(mockMapProps.routeCoordinates).toEqual(route.path));
  expect(mockMapProps.markers.map(p => p.id)).toEqual(['route-destination']);
  expect(mockMapProps.userCoordinate).toEqual({ lat: location.coordinate.lat, lng: location.coordinate.lng });
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

test('walking starts following its own route without a details screen or car lookup', async () => {
  const { user, rerender } = await renderWithProviders(<CarRoutePreview {...props} location={liveLocation()} />, { language: 'en' });
  await user.press(screen.getByRole('tab', { name: 'Walk' }));
  expect(screen.getByTestId('walk-summary')).toHaveTextContent(/10 min.*800 m/);
  expect(mockMapProps.routeCoordinates).toEqual(walking.path);
  expect(mockMapProps.routeSegments).toBeUndefined();
  expect(screen.queryByText(/steps|slope|stairs/i)).toBeNull();
  expect(screen.queryByRole('button', { name: 'Route details' })).toBeNull();
  await user.press(screen.getByRole('button', { name: 'Follow route in app' }));
  expect(screen.getByTestId('route-tracking-sheet')).toBeVisible();
  expect(mockMapProps.followUser).toBe(true);
  expect(mockMapProps.routeCoordinates).toEqual(walking.path);
  await rerender(<CarRoutePreview {...props} location={liveLocation(37.52, 127.02)} />);
  expect(mockMapProps.routeCoordinates).toEqual(walking.path);
  expect(findWalkingRoute).toHaveBeenCalledTimes(1);
  expect(findCarRoute).toHaveBeenCalledTimes(1);
});

test('late walking responses are discarded when switching to transit', async () => {
  let resolve!: (value: typeof walking) => void;
  jest.mocked(findWalkingRoute).mockImplementation(() => new Promise(yes => { resolve = yes; }));
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await user.press(screen.getByRole('tab', { name: 'Walk' }));
  const signal = jest.mocked(findWalkingRoute).mock.calls[0][2];
  expect(screen.getByRole('button', { name: 'Cancel request' })).toBeVisible();
  await user.press(screen.getByRole('tab', { name: 'Transit' }));
  expect(signal.aborted).toBe(true);
  await act(async () => resolve(walking));
  expect(screen.queryByTestId('walk-summary')).toBeNull();
  expect(screen.getByTestId('transit-summary')).toBeVisible();
  expect(mockMapProps.routeCoordinates).toBeUndefined();
});

test('failed walking route allows retry without an external navigation button', async () => {
  jest.mocked(findWalkingRoute).mockRejectedValueOnce(new ApiError('private', { code: 'ROUTE_NOT_FOUND', status: 422 }));
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await user.press(screen.getByRole('tab', { name: 'Walk' }));
  expect(screen.getByTestId('route-request')).toBeVisible();
  expect(mockMapProps.routeCoordinates).toBeUndefined();
  await user.press(screen.getByTestId('route-request'));
  expect(screen.getByTestId('walk-summary')).toHaveTextContent(/10 min/);
  expect(screen.queryByRole('tab', { name: 'Bicycle' })).toBeNull();
  expect(screen.queryByTestId('route-external')).toBeNull();
  expect(openNaverRoute).not.toHaveBeenCalled();
});

test('permission denial offers settings recovery without external navigation', async () => {
  const settings = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
  const refresh = jest.fn();
  const { user } = await renderWithProviders(<CarRoutePreview {...props} onRefreshLocation={refresh}
    location={{ status: 'denied', coordinate: null, canAskAgain: false }} />, { language: 'en' });
  expect(screen.queryByTestId('route-request')).toBeNull();
  expect(screen.getByRole('button', { name: 'Open location permission settings' })).toBeVisible();
  await user.press(screen.getByRole('button', { name: 'Open location permission settings' }));
  expect(settings).toHaveBeenCalledTimes(1);
  expect(refresh).not.toHaveBeenCalled();
  expect(screen.queryByTestId('route-external')).toBeNull();
  expect(openNaverRoute).not.toHaveBeenCalled();
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
  expect(screen.queryByTestId('route-external')).toBeNull();
  expect(findCarRoute).toHaveBeenCalledTimes(1);
  await user.press(screen.getByTestId('route-request'));
  await waitFor(() => expect(mockMapProps.routeCoordinates).toEqual(route.path));
});

test('missing destination prevents internal and external requests', async () => {
  await renderWithProviders(<CarRoutePreview {...props} destination={{ ...destination, latitude: undefined }} />, { language: 'en' });
  expect(screen.getByText('Destination coordinates are missing.')).toBeVisible();
  expect(screen.getByTestId('route-request')).toBeDisabled();
  expect(screen.queryByTestId('route-external')).toBeNull();
});

test('503 is an unavailable state without geometry, automatic retry or external navigation', async () => {
  jest.mocked(findCarRoute).mockRejectedValue(new ApiError('private message', { status: 503 }));
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await screen.findByText('Route service is currently unavailable. Use the NAVER Map app.');
  expect(screen.queryByText('private message')).toBeNull();
  expect(findCarRoute).toHaveBeenCalledTimes(1);
  expect(mockMapProps.routeCoordinates).toBeUndefined();
  expect(screen.queryByTestId('route-external')).toBeNull();
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
  expect(screen.getAllByRole('tab').map(tab => tab.props.accessibilityLabel)).toEqual(['Transit', 'Walk', 'Car']);
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

test('swap drops late geometry and freezes the former live origin as the destination', async () => {
  let resolve!: (value: typeof route) => void;
  jest.mocked(findCarRoute).mockImplementationOnce(() => new Promise(yes => { resolve = yes; })).mockResolvedValue(route);
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  const firstSignal = jest.mocked(findCarRoute).mock.calls[0][2];
  await fireEvent(screen.getByTestId('route-destination-row'), 'accessibilityAction', { nativeEvent: { actionName: 'swap' } });
  expect(firstSignal.aborted).toBe(true);
  await act(async () => resolve({ ...route, path: [{ lat: 1, lng: 1 }, { lat: 2, lng: 2 }] }));
  await waitFor(() => expect(mockMapProps.routeCoordinates).toEqual(route.path));
  expect(findCarRoute).toHaveBeenCalledTimes(2);
  expect(mockMapProps.userCoordinate).toEqual({ lat: location.coordinate.lat, lng: location.coordinate.lng });
  expect(findCarRoute).toHaveBeenLastCalledWith(destination, expect.objectContaining({ latitude: 37.5, longitude: 127 }), expect.anything());
  await screen.findByText('30 min');
  expect(screen.getByTestId('route-start')).toBeEnabled();
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
  expect(mockMapProps.userCoordinate).toEqual({ lat: location.coordinate.lat, lng: location.coordinate.lng });
});

test('long press without crossing a row does not edit or swap endpoints', async () => {
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await fireEvent(screen.getByTestId('route-origin-row'), 'longPress');
  await fireEvent.press(screen.getByTestId('route-origin-row'));
  expect(screen.queryByTestId('route-endpoint-editor')).toBeNull();
  expect(screen.getByTestId('route-start')).toBeEnabled();
  expect(openNaverRoute).not.toHaveBeenCalled();
});


test.each(['ko', 'en'] as const)('departure entry keeps the place as origin and opens the destination editor in %s', async language => {
  jest.mocked(findCarRoute).mockResolvedValue(route);
  const { user } = await renderWithProviders(<CarRoutePreview {...props} initialEndpointRole="origin" location={liveLocation()} />, { language });
  expect(screen.getByTestId('route-endpoint-editor')).toBeVisible();
  expect(screen.getByLabelText(language === 'ko' ? '장소 검색' : 'Search places')).toBeVisible();
  expect(screen.getByRole('button', {
    name: language === 'ko' ? `출발 장소 편집, ${destination.name}` : `Edit Origin, ${destination.name}`,
  })).toBeVisible();
  // The destination stays empty until the user picks one; nothing is routed to the current location by default.
  expect(findCarRoute).not.toHaveBeenCalled();
  expect(mockMapProps.markers.map(marker => marker.id)).toEqual(['route-origin']);
  await user.press(screen.getByRole('button', { name: 'Saved cafe' }));
  expect(screen.queryByTestId('route-endpoint-editor')).toBeNull();
  expect(findCarRoute).toHaveBeenLastCalledWith(
    expect.objectContaining({ placeId: destination.placeId, latitude: destination.latitude, longitude: destination.longitude }),
    expect.objectContaining({ placeId: 2, latitude: 37.7, longitude: 127.2 }),
    expect.anything(),
  );
});

test.each(['ko', 'en'] as const)('departure preview starts from the selected origin regardless of actual GPS in %s', async language => {
  const { user, rerender } = await renderWithProviders(<CarRoutePreview {...props} initialEndpointRole="origin" location={liveLocation()} />, { language });
  await user.press(screen.getByRole('button', { name: language === 'ko' ? '현재 위치' : 'Current location' }));
  await user.press(screen.getByTestId('route-start'));
  expect(screen.getByTestId('route-tracking-sheet')).toBeVisible();
  expect(screen.getByText(language === 'ko' ? /출발지 기준 미리보기/ : /Preview from selected origin/)).toBeVisible();
  expect(screen.queryByTestId('route-notice')).toBeNull();
  expect(mockMapProps.center).toEqual({ lat: destination.latitude, lng: destination.longitude });
  expect(mockMapProps.followUser).toBe(false);
  expect(mockMapProps.routeCoordinates).toEqual(route.path);
  expect(watchCurrentLocation).not.toHaveBeenCalled();
  expect(getCurrentLocation).not.toHaveBeenCalled();
  const distance = screen.getByTestId('route-tracking-distance').props.accessibilityLabel;
  // Real GPS is at the destination. It must not finish an assumed-origin preview.
  await rerender(<CarRoutePreview {...props} initialEndpointRole="origin" location={liveLocation(37.50001, 127)} />);
  expect(screen.queryByText(language === 'ko' ? '목적지에 도착했어요' : 'You have arrived')).toBeNull();
  expect(screen.getByTestId('route-tracking-distance').props.accessibilityLabel).toBe(distance);
  await act(() => mockMapProps.onCameraGesture?.());
  await user.press(screen.getByTestId('route-tracking-follow'));
  expect(mockMapProps.center).toEqual({ lat: destination.latitude, lng: destination.longitude });
  expect(findCarRoute).toHaveBeenCalledTimes(1);
  await user.press(screen.getByTestId('route-tracking-stop'));
  expect(screen.getByTestId('route-destination-row')).toHaveTextContent(language === 'ko' ? /선택 당시 내 위치/ : /My location when selected/);
});

test('departure entry without current location cannot route to a missing destination', async () => {
  const { user } = await renderWithProviders(<CarRoutePreview {...props} initialEndpointRole="origin"
    location={{ status: 'denied', coordinate: null, canAskAgain: false }} />, { language: 'en' });
  await user.press(screen.getByRole('button', { name: 'Close place editor' }));
  expect(screen.getByTestId('route-destination-row')).toHaveTextContent(/Set destination/);
  expect(screen.getByTestId('route-request')).toBeDisabled();
  expect(screen.queryByTestId('route-external')).toBeNull();
  expect(findCarRoute).not.toHaveBeenCalled();
  expect(mockMapProps.markers.map(marker => marker.id)).toEqual(['route-origin']);
});

test.each(['destination'] as const)('GPS changes clear a completed route when the %s entry uses current location', async initialEndpointRole => {
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
  expect(origin).toEqual(expect.objectContaining({ latitude: 37.55, longitude: 127.05 }));
});

test.each(['destination'] as const)('GPS changes discard an in-flight route when the %s entry uses current location', async initialEndpointRole => {
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
  expect(screen.getByTestId('route-tracking-summary')).toHaveTextContent(/30 min.*Estimate at lookup.*12.5 km.*Total distance/);
  expect(openNaverRoute).not.toHaveBeenCalled();
  expect(findCarRoute).toHaveBeenCalledTimes(1);
  await rerender(<CarRoutePreview {...props} location={liveLocation(37.55, 127.05)} />);
  expect(mockMapProps.routeCoordinates).toEqual(route.path);
  expect(mockMapProps.userCoordinate).toEqual({ lat: 37.55, lng: 127.05, accuracyMeters: 10, observedAt: expect.any(String) });
  expect(screen.getByTestId('route-tracking-distance')).toHaveTextContent(/Straight-line distance/);
  expect(screen.getByTestId('route-tracking-distance').props.accessibilityLabel).not.toBe(initialDistance);
  expect(screen.getByTestId('route-tracking-summary')).toHaveTextContent(/30 min.*Estimate at lookup.*12.5 km.*Total distance/);
  expect(findCarRoute).toHaveBeenCalledTimes(1);
  await act(() => mockMapProps.onCameraGesture?.());
  expect(mockMapProps.followUser).toBe(false);
  await user.press(screen.getByTestId('route-tracking-follow'));
  expect(mockMapProps.followUser).toBe(true);
  expect(mockMapProps.cameraFit).toBeUndefined();
  await act(() => mockMapProps.onCameraGesture?.());
  await user.press(screen.getByTestId('route-tracking-recenter'));
  expect(mockMapProps.followUser).toBe(true);
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
  expect(screen.getByText(/Following route/)).toBeVisible();
  expect(mockMapProps.followUser).toBe(true);
  expect(findCarRoute).toHaveBeenCalledTimes(1);
});

test('a selected origin can start a preview without location permission and retains its route', async () => {
  const { user, rerender } = await renderWithProviders(<CarRoutePreview {...props} location={liveLocation()} />, { language: 'en' });
  await user.press(screen.getByTestId('route-origin-row'));
  await user.press(screen.getByRole('button', { name: 'Saved cafe' }));
  await rerender(<CarRoutePreview {...props} location={{ status: 'denied', coordinate: null, canAskAgain: false }} />);
  await user.press(screen.getByTestId('route-start'));
  expect(screen.getByTestId('route-tracking-sheet')).toBeVisible();
  expect(screen.queryByTestId('route-notice')).toBeNull();
  expect(mockMapProps.center).toEqual({ lat: 37.7, lng: 127.2 });
  expect(mockMapProps.routeCoordinates).toEqual(route.path);
  expect(findCarRoute).toHaveBeenCalledTimes(2);
  expect(getCurrentLocation).not.toHaveBeenCalled();
  expect(watchCurrentLocation).not.toHaveBeenCalled();
});

test('a selected origin near actual GPS still follows real movement', async () => {
  const { user, rerender } = await renderWithProviders(<CarRoutePreview {...props} initialEndpointRole="origin" location={liveLocation()} />, { language: 'en' });
  await user.press(screen.getByRole('button', { name: 'Current location' }));
  await rerender(<CarRoutePreview {...props} initialEndpointRole="origin" location={liveLocation(37.6, 127.1)} />);
  await user.press(screen.getByTestId('route-start'));
  expect(mockMapProps.followUser).toBe(true);
  expect(watchCurrentLocation).toHaveBeenCalledWith(expect.any(Function), true);
  await rerender(<CarRoutePreview {...props} initialEndpointRole="origin" location={liveLocation()} />);
  expect(await screen.findByText('You have arrived')).toBeVisible();
  expect(findCarRoute).toHaveBeenCalledTimes(1);
});

test('imprecise GPS at the destination does not claim arrival', async () => {
  const { user, rerender } = await renderWithProviders(<CarRoutePreview {...props} location={liveLocation()} />, { language: 'en' });
  await user.press(screen.getByTestId('route-start'));
  await rerender(<CarRoutePreview {...props} location={liveLocation(destination.latitude, destination.longitude, 100)} />);
  expect(screen.queryByText('You have arrived')).toBeNull();
  expect(screen.getByText(/Following route/)).toBeVisible();
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

test('starting revalidates stale GPS without discarding the preview or querying a new route', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  try {
    const { user } = await renderWithProviders(<CarRoutePreview {...props} location={liveLocation(37.5, 127, 10, new Date(Date.now() - 60_000).toISOString())} />, { language: 'en' });
    await user.press(screen.getByTestId('route-start'));
    expect(getCurrentLocation).toHaveBeenCalledWith(false, true);
    expect(screen.getByText(/Could not get a new location/)).toBeVisible();
    expect(alert).not.toHaveBeenCalled();
    await user.press(screen.getByTestId('route-notice-close'));
    expect(screen.queryByTestId('route-tracking-sheet')).toBeNull();
    expect(mockMapProps.routeCoordinates).toEqual(route.path);
    expect(findCarRoute).toHaveBeenCalledTimes(1);
  } finally { alert.mockRestore(); }
});

test('selection-time destination preserves an in-flight route through GPS movement and permission loss', async () => {
  let resolve!: (value: typeof route) => void;
  jest.mocked(findCarRoute).mockImplementationOnce(() => new Promise(yes => { resolve = yes; }));
  const { rerender, user } = await renderWithProviders(<CarRoutePreview {...props} initialEndpointRole="origin" />, { language: 'en' });
  await user.press(screen.getByRole('button', { name: 'Current location' }));
  const signal = jest.mocked(findCarRoute).mock.calls[0][2];
  await rerender(<CarRoutePreview {...props} initialEndpointRole="origin" location={liveLocation(37.55, 127.05)} />);
  expect(signal.aborted).toBe(false);
  await act(async () => resolve(route));
  await rerender(<CarRoutePreview {...props} initialEndpointRole="origin" location={{ status: 'denied', coordinate: null, canAskAgain: false }} />);
  expect(mockMapProps.routeCoordinates).toEqual(route.path);
  expect(mockMapProps.markers.find(marker => marker.id === 'route-destination')).toEqual(expect.objectContaining({ lat: 37.5, lng: 127 }));
  expect(screen.getByText('30 min')).toBeVisible();
  expect(findCarRoute).toHaveBeenCalledTimes(1);
});

test('a destination waiting for GPS captures the first fix once', async () => {
  const { rerender, user } = await renderWithProviders(<CarRoutePreview {...props} initialEndpointRole="origin" location={{ status: 'loading', coordinate: null, canAskAgain: true }} />, { language: 'en' });
  await user.press(screen.getByRole('button', { name: 'Current location' }));
  expect(findCarRoute).not.toHaveBeenCalled();
  await rerender(<CarRoutePreview {...props} initialEndpointRole="origin" location={liveLocation()} />);
  expect(findCarRoute).toHaveBeenCalledTimes(1);
  await rerender(<CarRoutePreview {...props} initialEndpointRole="origin" location={liveLocation(37.55, 127.05)} />);
  expect(findCarRoute).toHaveBeenCalledTimes(1);
  expect(mockMapProps.routeCoordinates).toEqual(route.path);
  expect(mockMapProps.markers.find(marker => marker.id === 'route-destination')).toEqual(expect.objectContaining({ lat: 37.5, lng: 127 }));
});

test('selecting current location in the destination editor replaces its snapshot only on explicit selection', async () => {
  const { user, rerender } = await renderWithProviders(<CarRoutePreview {...props} initialEndpointRole="origin" />, { language: 'en' });
  await user.press(screen.getByRole('button', { name: 'Current location' }));
  await rerender(<CarRoutePreview {...props} initialEndpointRole="origin" location={liveLocation(37.55, 127.05)} />);
  await user.press(screen.getByTestId('route-destination-row'));
  await user.press(screen.getByRole('button', { name: 'Current location' }));
  expect(findCarRoute).toHaveBeenCalledTimes(2);
  expect(findCarRoute).toHaveBeenLastCalledWith(destination, expect.objectContaining({ latitude: 37.55, longitude: 127.05, isCurrentLocation: false }), expect.any(AbortSignal));
  await rerender(<CarRoutePreview {...props} initialEndpointRole="origin" location={liveLocation(37.57, 127.07)} />);
  expect(findCarRoute).toHaveBeenCalledTimes(2);
  expect(mockMapProps.routeCoordinates).toEqual(route.path);
});

test('swapping a live origin into the destination captures its coordinates', async () => {
  const { rerender } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await fireEvent(screen.getByTestId('route-destination-row'), 'accessibilityAction', { nativeEvent: { actionName: 'swap' } });
  expect(findCarRoute).toHaveBeenCalledTimes(2);
  await rerender(<CarRoutePreview {...props} location={liveLocation(37.55, 127.05)} />);
  expect(mockMapProps.routeCoordinates).toEqual(route.path);
  expect(mockMapProps.markers.find(marker => marker.id === 'route-destination')).toEqual(expect.objectContaining({ lat: 37.5, lng: 127 }));
  expect(findCarRoute).toHaveBeenCalledTimes(2);
});

test('a stale map fix is refreshed at high accuracy and starts the selected route without a second tap', async () => {
  let resolve!: (value: Awaited<ReturnType<typeof getCurrentLocation>>) => void;
  jest.mocked(getCurrentLocation).mockImplementation(() => new Promise(yes => { resolve = yes; }));
  const { user } = await renderWithProviders(<CarRoutePreview {...props} location={liveLocation(37.5, 127, 10, new Date(Date.now() - 60_000).toISOString())} />, { language: 'en' });
  await user.press(screen.getByTestId('route-start'));
  expect(screen.getByTestId('route-start-locating')).toBeVisible();
  expect(getCurrentLocation).toHaveBeenCalledWith(false, true);
  await act(async () => resolve(liveLocation()));
  expect(screen.queryByTestId('route-notice')).toBeNull();
  expect(screen.getByTestId('route-tracking-sheet')).toBeVisible();
  expect(mockMapProps.followUser).toBe(true);
  expect(findCarRoute).toHaveBeenCalledTimes(1);
  expect(watchCurrentLocation).toHaveBeenCalledWith(expect.any(Function), true);
});

test('closing the custom notice cancels pending start and ignores a late GPS result', async () => {
  let resolve!: (value: Awaited<ReturnType<typeof getCurrentLocation>>) => void;
  jest.mocked(getCurrentLocation).mockImplementation(() => new Promise(yes => { resolve = yes; }));
  const { user } = await renderWithProviders(<CarRoutePreview {...props} location={liveLocation(37.5, 127, 300)} />, { language: 'en' });
  await user.press(screen.getByTestId('route-start'));
  await user.press(screen.getByTestId('route-notice-close'));
  await act(async () => resolve(liveLocation()));
  expect(screen.queryByTestId('route-notice')).toBeNull();
  expect(screen.queryByTestId('route-tracking-sheet')).toBeNull();
  expect(mockMapProps.routeCoordinates).toEqual(route.path);
  expect(watchCurrentLocation).not.toHaveBeenCalled();
});

test('low GPS accuracy is explained with its reported value and retry starts after a better fix', async () => {
  jest.mocked(getCurrentLocation).mockResolvedValueOnce(liveLocation(37.5, 127, 350)).mockImplementationOnce(async () => liveLocation());
  const { user } = await renderWithProviders(<CarRoutePreview {...props} location={liveLocation(37.5, 127, 300)} />, { language: 'en' });
  await user.press(screen.getByTestId('route-start'));
  expect(screen.getByText('Reported GPS accuracy: about 350 m')).toBeVisible();
  await user.press(screen.getByTestId('route-notice-retry'));
  expect(screen.getByTestId('route-tracking-sheet')).toBeVisible();
  expect(getCurrentLocation).toHaveBeenCalledTimes(2);
  expect(findCarRoute).toHaveBeenCalledTimes(1);
});

test('precise foreground fixes drive tracking and its subscription is removed on stop', async () => {
  const { user } = await renderWithProviders(<CarRoutePreview {...props} location={liveLocation()} />, { language: 'en' });
  await user.press(screen.getByTestId('route-start'));
  const onCoordinate = jest.mocked(watchCurrentLocation).mock.calls[0][0];
  const updated = { lat: 37.55, lng: 127.05, accuracyMeters: 8, observedAt: new Date(Date.now() + 1).toISOString() };
  await act(() => onCoordinate(updated));
  expect(mockMapProps.userCoordinate).toEqual(updated);
  expect(mockMapProps.routeCoordinates).toEqual(route.path);
  await user.press(screen.getByTestId('route-tracking-stop'));
  expect(mockRemoveLocationWatch).toHaveBeenCalledTimes(1);
});


test('main directions entry keeps both endpoints empty across GPS updates and does not query', async () => {
  const view = await renderWithProviders(<CarRoutePreview {...props} destination={null} />, { language: 'en' });
  expect(screen.getByTestId('route-origin-row')).toHaveTextContent(/Set origin/);
  expect(screen.getByTestId('route-destination-row')).toHaveTextContent(/Set destination/);
  expect(findCarRoute).not.toHaveBeenCalled();
  expect(mockMapProps.markers).toHaveLength(0);
  await view.rerender(<CarRoutePreview {...props} destination={null}
    location={{ ...location, coordinate: { ...location.coordinate, lat: 37.51 } }} />);
  await fireEvent(screen.getByTestId('route-origin-row'), 'accessibilityAction', { nativeEvent: { actionName: 'swap' } });
  expect(screen.getByTestId('route-origin-row')).toHaveTextContent(/Set origin/);
  expect(screen.getByTestId('route-destination-row')).toHaveTextContent(/Set destination/);
  expect(findCarRoute).not.toHaveBeenCalled();
});

test('empty planner searches editable endpoints and queries only after both are selected', async () => {
  const { user } = await renderWithProviders(<CarRoutePreview {...props} destination={null} />, { language: 'en' });
  await user.press(screen.getByTestId('route-destination-row'));
  await user.press(screen.getByRole('button', { name: 'Saved cafe' }));
  expect(screen.getByTestId('route-destination-row')).toHaveTextContent(/Saved cafe/);
  expect(screen.getByTestId('route-origin-row')).toHaveTextContent(/Set origin/);
  expect(findCarRoute).not.toHaveBeenCalled();
  await user.press(screen.getByTestId('route-origin-row'));
  await fireEvent.changeText(screen.getByTestId('route-endpoint-search'), 'New place');
  await user.press(await screen.findByText('New place'));
  await waitFor(() => expect(findCarRoute).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'New place', latitude: 37.9 }),
    expect.objectContaining({ name: 'Saved cafe', latitude: 37.7 }), expect.any(AbortSignal)));
});

test('transit rate limit also blocks walking without invoking its provider', async () => {
  jest.mocked(findTransitRoute).mockRejectedValue(new ApiError('limited', { status: 429, retryAfterSeconds: 120 }));
  const { user } = await renderWithProviders(<CarRoutePreview {...props} />, { language: 'en' });
  await user.press(screen.getByRole('tab', { name: 'Transit' }));
  await user.press(screen.getByRole('tab', { name: 'Walk' }));
  expect(screen.getByText(/Too many requests/)).toBeVisible();
  expect(findWalkingRoute).not.toHaveBeenCalled();
  expect(mockMapProps.routeCoordinates).toBeUndefined();
});


test('swiping transit alternatives updates the map and starts guidance with the selected separate segments', async () => {
  const { user, rerender } = await renderWithProviders(<CarRoutePreview {...props} location={liveLocation()} />, { language: 'en' });
  await user.press(screen.getByRole('tab', { name: 'Transit' }));
  await fireEvent(screen.getByTestId('transit-pager-frame'), 'layout', { nativeEvent: { layout: { width: 350, height: 200 } } });
  await fireEvent(screen.getByTestId('transit-route-pager'), 'momentumScrollEnd', { nativeEvent: { contentOffset: { x: 350, y: 0 } } });
  expect(screen.getByRole('button', { name: 'Route 2 of 2' }).props.accessibilityState).toEqual({ selected: true });
  expect(screen.getByTestId('transit-summary')).toHaveTextContent(/30 min/);
  const segments = mockMapProps.routeSegments;
  const markers = mockMapProps.markers;
  expect(screen.queryByRole('button', { name: 'Route details' })).toBeNull();
  await user.press(screen.getByRole('button', { name: 'Follow route in app' }));
  expect(screen.queryByTestId('transit-details')).toBeNull();
  expect(screen.getByTestId('route-tracking-sheet')).toBeVisible();
  expect(mockMapProps.routeCoordinates).toBeUndefined();
  expect(mockMapProps.routeSegments).toEqual(segments);
  expect(mockMapProps.markers).toEqual(markers);
  expect(mockMapProps.followUser).toBe(true);
  await rerender(<CarRoutePreview {...props} location={liveLocation(37.52, 127.02)} />);
  expect(mockMapProps.routeSegments).toEqual(segments);
  expect(findTransitRoute).toHaveBeenCalledTimes(1);
  expect(findCarRoute).toHaveBeenCalledTimes(1);
});
